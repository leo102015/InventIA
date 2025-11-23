from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(
    prefix="/compras",
    tags=["compras"]
)

# --- Crear Orden de Compra ---
@router.post("/", response_model=schemas.OrdenCompraResponse)
def create_orden_compra(
    orden: schemas.OrdenCompraCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    # 1. Crear la cabecera de la orden
    db_orden = models.OrdenCompra(
        proveedor_id=orden.proveedor_id,
        estado="Solicitada"
    )
    db.add(db_orden)
    db.flush() # Para obtener el ID de la orden

    # 2. Crear los detalles
    for item in orden.detalles:
        if not item.materia_prima_id and not item.producto_reventa_id:
            raise HTTPException(status_code=400, detail="El detalle debe tener un material o producto asociado")
        
        db_detalle = models.DetalleOrdenCompra(
            orden_compra_id=db_orden.id,
            cantidad=item.cantidad,
            costoUnitario=item.costoUnitario,
            materia_prima_id=item.materia_prima_id,
            producto_reventa_id=item.producto_reventa_id
        )
        db.add(db_detalle)
    
    db.commit()
    db.refresh(db_orden)
    return db_orden

# --- Listar Órdenes ---
@router.get("/", response_model=List[schemas.OrdenCompraResponse])
def read_ordenes_compra(db: Session = Depends(get_db)):
    return db.query(models.OrdenCompra).order_by(models.OrdenCompra.fecha.desc()).all()

# --- Recibir Orden (Actualizar Stock) ---
@router.put("/{orden_id}/recibir", response_model=schemas.OrdenCompraResponse)
def recibir_orden_compra(orden_id: int, db: Session = Depends(get_db)):
    return update_orden_compra(orden_id, schemas.OrdenCompraUpdate(estado="Recibida"), db)

# NUEVO: Editar Compra (Reversión Stock)
@router.put("/{id}", response_model=schemas.OrdenCompraResponse)
def update_orden_compra(id: int, update: schemas.OrdenCompraUpdate, db: Session = Depends(get_db)):
    orden = db.query(models.OrdenCompra).filter(models.OrdenCompra.id == id).first()
    if not orden: raise HTTPException(404, "Orden no encontrada")

    estado_ant = orden.estado
    nuevo = update.estado

    # 1. Solicitada -> Recibida (Aumentar Stock)
    if estado_ant == "Solicitada" and nuevo == "Recibida":
        for d in orden.detalles:
            if d.materia_prima: d.materia_prima.stockActual += d.cantidad
            if d.producto_reventa: d.producto_reventa.stockActual += d.cantidad
    
    # 2. Recibida -> Solicitada (Disminuir Stock - Corrección de error)
    elif estado_ant == "Recibida" and nuevo == "Solicitada":
        for d in orden.detalles:
            if d.materia_prima:
                if d.materia_prima.stockActual < d.cantidad: raise HTTPException(400, "No se puede revertir: stock ya utilizado.")
                d.materia_prima.stockActual -= d.cantidad
            if d.producto_reventa:
                if d.producto_reventa.stockActual < d.cantidad: raise HTTPException(400, "No se puede revertir: stock ya vendido.")
                d.producto_reventa.stockActual -= d.cantidad

    if nuevo: orden.estado = nuevo
    db.commit()
    db.refresh(orden)
    return orden

@router.delete("/{id}")
def delete_orden_compra(id: int, db: Session = Depends(get_db)):
    orden = db.query(models.OrdenCompra).filter(models.OrdenCompra.id == id).first()
    if not orden: raise HTTPException(404, "Orden no encontrada")
    
    # Revertir stock si ya fue recibida
    if orden.estado == "Recibida":
        for d in orden.detalles:
            if d.materia_prima: d.materia_prima.stockActual -= d.cantidad
            if d.producto_reventa: d.producto_reventa.stockActual -= d.cantidad

    db.delete(orden)
    db.commit()
    return {"ok": True}