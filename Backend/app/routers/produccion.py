from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(
    prefix="/produccion",
    tags=["produccion"]
)

# --- VARIANTES ---
@router.post("/variantes", response_model=schemas.VarianteResponse)
def create_variante(variante: schemas.VarianteCreate, db: Session = Depends(get_db)):
    db_var = models.VarianteProducto(**variante.model_dump())
    db.add(db_var)
    db.commit()
    db.refresh(db_var)
    return db_var

@router.get("/variantes", response_model=List[schemas.VarianteResponse])
def read_variantes(db: Session = Depends(get_db)):
    return db.query(models.VarianteProducto).all()

# --- BOM (Recetas) ---
@router.post("/bom", response_model=schemas.BOMResponse)
def create_bom_item(bom: schemas.BOMCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe la relación
    existe = db.query(models.ListaMateriales).filter(
        models.ListaMateriales.producto_fabricado_id == bom.producto_fabricado_id,
        models.ListaMateriales.materia_prima_id == bom.materia_prima_id
    ).first()
    
    if existe:
        raise HTTPException(status_code=400, detail="Este material ya está en la lista del producto")

    db_bom = models.ListaMateriales(**bom.model_dump())
    db.add(db_bom)
    db.commit()
    db.refresh(db_bom)
    return db_bom

# NUEVO: Obtener TODO el BOM (para la tabla general)
@router.get("/bom", response_model=List[schemas.BOMResponse])
def read_all_bom(db: Session = Depends(get_db)):
    return db.query(models.ListaMateriales).all()

@router.get("/bom/{producto_id}", response_model=List[schemas.BOMResponse])
def read_bom_by_producto(producto_id: int, db: Session = Depends(get_db)):
    return db.query(models.ListaMateriales).filter(models.ListaMateriales.producto_fabricado_id == producto_id).all()

# NUEVO: Eliminar item del BOM
@router.delete("/bom/{id}")
def delete_bom_item(id: int, db: Session = Depends(get_db)):
    item = db.query(models.ListaMateriales).filter(models.ListaMateriales.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    db.delete(item)
    db.commit()
    return {"ok": True}

# NUEVO: Editar Cantidad BOM
@router.put("/bom/{id}", response_model=schemas.BOMResponse)
def update_bom_item(id: int, bom: schemas.BOMUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ListaMateriales).filter(models.ListaMateriales.id == id).first()
    if not item: raise HTTPException(status_code=404, detail="Item no encontrado")
    
    item.cantidadRequerida = bom.cantidadRequerida
    db.commit()
    db.refresh(item)
    return item

# --- ÓRDENES DE PRODUCCIÓN ---
@router.post("/ordenes", response_model=schemas.OrdenProduccionResponse)
def create_orden(orden: schemas.OrdenProduccionCreate, db: Session = Depends(get_db)):
    db_orden = models.OrdenProduccion(**orden.model_dump())
    db.add(db_orden)
    db.commit()
    db.refresh(db_orden)
    return db_orden

@router.get("/ordenes", response_model=List[schemas.OrdenProduccionResponse])
def read_ordenes(db: Session = Depends(get_db)):
    return db.query(models.OrdenProduccion).order_by(models.OrdenProduccion.fechaCreacion.desc()).all()

# Endpoint específico para flujo rápido (Terminar)
@router.put("/ordenes/{orden_id}/terminar", response_model=schemas.OrdenProduccionResponse)
def terminar_orden(orden_id: int, db: Session = Depends(get_db)):
    # ... (Lógica original de terminar, reutilizada abajo en update)
    return update_orden_produccion(orden_id, schemas.OrdenProduccionUpdate(estado="Terminado"), db)

# NUEVO: Editar Orden (Manejo de Reversión de Stock)
@router.put("/ordenes/{id}", response_model=schemas.OrdenProduccionResponse)
def update_orden_produccion(id: int, update: schemas.OrdenProduccionUpdate, db: Session = Depends(get_db)):
    orden = db.query(models.OrdenProduccion).filter(models.OrdenProduccion.id == id).first()
    if not orden: raise HTTPException(404, "Orden no encontrada")

    estado_anterior = orden.estado
    nuevo_estado = update.estado

    # 1. Lógica: En Proceso -> Terminado (Consumir Materia, Aumentar Producto)
    if estado_anterior != "Terminado" and nuevo_estado == "Terminado":
        variante = orden.variante
        bom_list = db.query(models.ListaMateriales).filter(models.ListaMateriales.producto_fabricado_id == variante.producto_fabricado_id).all()
        
        # Verificar y descontar materia prima
        for item in bom_list:
            req = item.cantidadRequerida * orden.cantidadProducida
            if item.materia_prima.stockActual < req:
                raise HTTPException(400, f"Stock insuficiente de {item.materia_prima.nombre}")
            item.materia_prima.stockActual -= int(req)
        
        variante.stockActual += orden.cantidadProducida
        orden.fechaFinalizacion = datetime.now()

    # 2. Lógica: Terminado -> En Proceso (Devolver Materia, Restar Producto)
    elif estado_anterior == "Terminado" and nuevo_estado == "En Proceso":
        variante = orden.variante
        if variante.stockActual < orden.cantidadProducida:
            raise HTTPException(400, "No se puede revertir: El producto fabricado ya fue vendido o movido.")
        
        variante.stockActual -= orden.cantidadProducida
        
        bom_list = db.query(models.ListaMateriales).filter(models.ListaMateriales.producto_fabricado_id == variante.producto_fabricado_id).all()
        for item in bom_list:
            devolver = item.cantidadRequerida * orden.cantidadProducida
            item.materia_prima.stockActual += int(devolver)
        
        orden.fechaFinalizacion = None

    if nuevo_estado: orden.estado = nuevo_estado
    db.commit()
    db.refresh(orden)
    return orden

# NUEVO: Eliminar (Cancelar) Orden Producción
@router.delete("/ordenes/{id}")
def delete_orden_produccion(id: int, db: Session = Depends(get_db)):
    orden = db.query(models.OrdenProduccion).filter(models.OrdenProduccion.id == id).first()
    if not orden: raise HTTPException(404, "Orden no encontrada")
    
    # Si está terminada, revertir stock antes de borrar
    if orden.estado == "Terminado":
        # Reutilizamos la lógica de reversión
        variante = orden.variante
        if variante.stockActual >= orden.cantidadProducida:
            variante.stockActual -= orden.cantidadProducida
            bom_list = db.query(models.ListaMateriales).filter(models.ListaMateriales.producto_fabricado_id == variante.producto_fabricado_id).all()
            for item in bom_list:
                item.materia_prima.stockActual += int(item.cantidadRequerida * orden.cantidadProducida)
    
    db.delete(orden)
    db.commit()
    return {"ok": True}