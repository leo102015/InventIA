from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(prefix="/ventas", tags=["ventas"])

# --- Canales ---
@router.get("/canales", response_model=List[schemas.CanalVentaResponse])
def get_canales(db: Session = Depends(get_db)):
    return db.query(models.CanalVenta).all()

# --- Crear Venta (Manual) ---
@router.post("/", response_model=schemas.OrdenVentaResponse)
def create_venta(
    orden: schemas.OrdenVentaCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    # 1. Crear cabecera
    db_orden = models.OrdenVenta(
        canal_venta_id=orden.canal_venta_id,
        estado=orden.estado,
        usuario_id=current_user.id
    )
    db.add(db_orden)
    db.flush()

    # 2. Procesar detalles y descontar stock
    for item in orden.detalles:
        if not item.variante_producto_id and not item.producto_reventa_id:
            raise HTTPException(400, "El detalle debe tener un producto asociado")

        # A. Si es Variante (Fabricación)
        if item.variante_producto_id:
            variante = db.query(models.VarianteProducto).filter(models.VarianteProducto.id == item.variante_producto_id).first()
            if not variante: raise HTTPException(404, "Variante no encontrada")
            
            if variante.stockActual < item.cantidad:
                raise HTTPException(400, f"Stock insuficiente para {variante.talla} {variante.color}. Disponible: {variante.stockActual}")
            
            variante.stockActual -= item.cantidad

        # B. Si es Producto Reventa
        elif item.producto_reventa_id:
            prod = db.query(models.ProductoReventa).filter(models.ProductoReventa.id == item.producto_reventa_id).first()
            if not prod: raise HTTPException(404, "Producto no encontrado")
            
            if prod.stockActual < item.cantidad:
                raise HTTPException(400, f"Stock insuficiente para {prod.nombre}. Disponible: {prod.stockActual}")
            
            prod.stockActual -= item.cantidad

        # Crear detalle
        db_detalle = models.DetalleOrdenVenta(
            orden_venta_id=db_orden.id,
            cantidad=item.cantidad,
            precioUnitario=item.precioUnitario,
            variante_producto_id=item.variante_producto_id,
            producto_reventa_id=item.producto_reventa_id
        )
        db.add(db_detalle)

    db.commit()
    db.refresh(db_orden)
    return db_orden

# --- Listar Ventas ---
@router.get("/", response_model=List[schemas.OrdenVentaResponse])
def read_ventas(db: Session = Depends(get_db)):
    return db.query(models.OrdenVenta).order_by(models.OrdenVenta.fecha.desc()).all()

# --- Eliminar (Cancelar) Venta y Devolver Stock ---
@router.delete("/{id}")
def delete_venta(id: int, db: Session = Depends(get_db)):
    orden = db.query(models.OrdenVenta).filter(models.OrdenVenta.id == id).first()
    if not orden: raise HTTPException(404, "Venta no encontrada")

    # Devolver stock
    for item in orden.detalles:
        if item.variante_producto_id:
            var = db.query(models.VarianteProducto).filter(models.VarianteProducto.id == item.variante_producto_id).first()
            if var: var.stockActual += item.cantidad
        elif item.producto_reventa_id:
            prod = db.query(models.ProductoReventa).filter(models.ProductoReventa.id == item.producto_reventa_id).first()
            if prod: prod.stockActual += item.cantidad

    db.delete(orden)
    db.commit()
    return {"ok": True}