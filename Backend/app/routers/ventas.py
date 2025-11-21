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
    # Estado inicial por defecto: En Proceso
    estado_inicial = "En Proceso"
    
    db_orden = models.OrdenVenta(
        canal_venta_id=orden.canal_venta_id,
        estado=estado_inicial,
        usuario_id=current_user.id
    )
    db.add(db_orden)
    db.flush()

    for item in orden.detalles:
        # Descontar Stock (Lógica normal de venta)
        if item.variante_producto_id:
            variante = db.query(models.VarianteProducto).filter(models.VarianteProducto.id == item.variante_producto_id).first()
            if variante.stockActual < item.cantidad:
                raise HTTPException(400, f"Stock insuficiente: {variante.talla} {variante.color}")
            variante.stockActual -= item.cantidad
        elif item.producto_reventa_id:
            prod = db.query(models.ProductoReventa).filter(models.ProductoReventa.id == item.producto_reventa_id).first()
            if prod.stockActual < item.cantidad:
                raise HTTPException(400, f"Stock insuficiente: {prod.nombre}")
            prod.stockActual -= item.cantidad

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

@router.get("/", response_model=List[schemas.OrdenVentaResponse])
def read_ventas(db: Session = Depends(get_db)):
    return db.query(models.OrdenVenta).order_by(models.OrdenVenta.fecha.desc()).all()

# NUEVO: Editar Venta (Cambio de Estado y Devolución)
@router.put("/{id}", response_model=schemas.OrdenVentaResponse)
def update_venta(id: int, venta_update: schemas.OrdenVentaUpdate, db: Session = Depends(get_db)):
    orden = db.query(models.OrdenVenta).filter(models.OrdenVenta.id == id).first()
    if not orden: raise HTTPException(404, "Venta no encontrada")

    estado_anterior = orden.estado
    nuevo_estado = venta_update.estado

    # Lógica de Devolución de Stock
    if nuevo_estado == "Devolución" and estado_anterior != "Devolución":
        # Reingresar stock
        for d in orden.detalles:
            if d.variante: d.variante.stockActual += d.cantidad
            if d.producto_reventa: d.producto_reventa.stockActual += d.cantidad
            # Visualmente el total será 0 en el frontend, pero mantenemos el registro del detalle
    
    # Lógica de Reactivación (Si estaba en devolución y vuelve a venderse)
    if estado_anterior == "Devolución" and nuevo_estado != "Devolución":
        # Descontar stock nuevamente
        for d in orden.detalles:
            if d.variante: 
                if d.variante.stockActual < d.cantidad: raise HTTPException(400, "Stock insuficiente para reactivar venta")
                d.variante.stockActual -= d.cantidad
            if d.producto_reventa:
                if d.producto_reventa.stockActual < d.cantidad: raise HTTPException(400, "Stock insuficiente para reactivar venta")
                d.producto_reventa.stockActual -= d.cantidad

    if venta_update.estado: orden.estado = venta_update.estado
    if venta_update.canal_venta_id: orden.canal_venta_id = venta_update.canal_venta_id

    db.commit()
    db.refresh(orden)
    return orden

@router.delete("/{id}")
def delete_venta(id: int, db: Session = Depends(get_db)):
    orden = db.query(models.OrdenVenta).filter(models.OrdenVenta.id == id).first()
    if not orden: raise HTTPException(404, "Venta no encontrada")

    # Si no es devolución, devolver stock al borrar
    if orden.estado != "Devolución":
        for item in orden.detalles:
            if item.variante: item.variante.stockActual += item.cantidad
            if item.producto_reventa: item.producto_reventa.stockActual += item.cantidad

    db.delete(orden)
    db.commit()
    return {"ok": True}

# --- CRUD CANALES ---
@router.post("/canales", response_model=schemas.CanalVentaResponse)
def create_canal(canal: schemas.CanalVentaCreate, db: Session = Depends(get_db)):
    db_canal = models.CanalVenta(nombre=canal.nombre)
    db.add(db_canal)
    db.commit()
    db.refresh(db_canal)
    return db_canal

@router.put("/canales/{id}", response_model=schemas.CanalVentaResponse)
def update_canal(id: int, canal: schemas.CanalVentaUpdate, db: Session = Depends(get_db)):
    db_canal = db.query(models.CanalVenta).filter(models.CanalVenta.id == id).first()
    if not db_canal:
        raise HTTPException(status_code=404, detail="Canal no encontrado")
    
    db_canal.nombre = canal.nombre
    db.commit()
    db.refresh(db_canal)
    return db_canal

@router.delete("/canales/{id}")
def delete_canal(id: int, db: Session = Depends(get_db)):
    db_canal = db.query(models.CanalVenta).filter(models.CanalVenta.id == id).first()
    if not db_canal:
        raise HTTPException(status_code=404, detail="Canal no encontrado")
    
    try:
        db.delete(db_canal)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar: Hay ventas asociadas a este canal.")
    
    return {"ok": True}