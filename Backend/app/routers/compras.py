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
def recibir_orden_compra(
    orden_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    orden = db.query(models.OrdenCompra).filter(models.OrdenCompra.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    if orden.estado == "Recibida":
        raise HTTPException(status_code=400, detail="Esta orden ya fue recibida")

    # Cambiar estado
    orden.estado = "Recibida"

    # Actualizar Stocks
    for detalle in orden.detalles:
        if detalle.materia_prima_id:
            mat = db.query(models.MateriaPrima).filter(models.MateriaPrima.id == detalle.materia_prima_id).first()
            if mat:
                mat.stockActual += detalle.cantidad
                # Opcional: Actualizar costo promedio aquí si fuera necesario
        
        elif detalle.producto_reventa_id:
            prod = db.query(models.ProductoReventa).filter(models.ProductoReventa.id == detalle.producto_reventa_id).first()
            if prod:
                prod.stockActual += detalle.cantidad
    
    db.commit()
    db.refresh(orden)
    return orden