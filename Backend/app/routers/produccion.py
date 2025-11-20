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

@router.put("/ordenes/{orden_id}/terminar", response_model=schemas.OrdenProduccionResponse)
def terminar_orden(orden_id: int, db: Session = Depends(get_db)):
    orden = db.query(models.OrdenProduccion).filter(models.OrdenProduccion.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    if orden.estado == "Terminado":
        raise HTTPException(status_code=400, detail="La orden ya está terminada")

    # 1. Obtener la variante y su producto padre
    variante = db.query(models.VarianteProducto).filter(models.VarianteProducto.id == orden.variante_producto_id).first()
    producto_padre_id = variante.producto_fabricado_id

    # 2. Obtener la receta (BOM)
    bom_list = db.query(models.ListaMateriales).filter(models.ListaMateriales.producto_fabricado_id == producto_padre_id).all()

    # 3. Validar y Descontar Materia Prima
    for item in bom_list:
        cantidad_total_requerida = item.cantidadRequerida * orden.cantidadProducida
        material = db.query(models.MateriaPrima).filter(models.MateriaPrima.id == item.materia_prima_id).first()
        
        if material.stockActual < cantidad_total_requerida:
            raise HTTPException(status_code=400, detail=f"No hay suficiente stock de {material.nombre}. Requerido: {cantidad_total_requerida}, Disponible: {material.stockActual}")
        
        material.stockActual -= int(cantidad_total_requerida) # Descontamos stock

    # 4. Aumentar stock del producto terminado (Variante)
    variante.stockActual += orden.cantidadProducida

    # 5. Cerrar orden
    orden.estado = "Terminado"
    orden.fechaFinalizacion = datetime.now()

    db.commit()
    db.refresh(orden)
    return orden