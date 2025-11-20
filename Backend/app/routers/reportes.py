from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Any
from datetime import date, datetime, time
from app.core.database import get_db
from app.models import models

router = APIRouter(
    prefix="/reportes",
    tags=["reportes"]
)

# --- REPORTE DE VENTAS (Filtrado por fecha) ---
@router.get("/ventas")
def reporte_ventas(
    fecha_inicio: date,
    fecha_fin: date,
    db: Session = Depends(get_db)
):
    # Convertir date a datetime para cubrir todo el día
    inicio = datetime.combine(fecha_inicio, time.min)
    fin = datetime.combine(fecha_fin, time.max)

    ventas = db.query(models.OrdenVenta).filter(
        models.OrdenVenta.fecha >= inicio,
        models.OrdenVenta.fecha <= fin
    ).order_by(models.OrdenVenta.fecha.desc()).all()

    resultado = []
    for v in ventas:
        total_orden = sum([d.cantidad * d.precioUnitario for d in v.detalles])
        
        # Generar resumen de items
        items_desc = []
        for d in v.detalles:
            if d.variante:
                items_desc.append(f"{d.variante.producto_fabricado.nombre} ({d.variante.talla}/{d.variante.color}) x{d.cantidad}")
            elif d.producto_reventa:
                items_desc.append(f"{d.producto_reventa.nombre} x{d.cantidad}")
        
        resultado.append({
            "id_orden": v.id,
            "fecha": v.fecha,
            "canal": v.canal.nombre,
            "items": ", ".join(items_desc),
            "total_venta": float(total_orden),
            "estado": v.estado
        })
    return resultado

# --- REPORTE INVENTARIO PRODUCTO (Valorizado) ---
@router.get("/inventario-producto")
def reporte_inventario_producto(db: Session = Depends(get_db)):
    # 1. Variantes de Productos Fabricados
    variantes = db.query(models.VarianteProducto).all()
    # 2. Productos de Reventa
    reventa = db.query(models.ProductoReventa).all()

    resultado = []

    for v in variantes:
        valor_total = float(v.stockActual) * float(v.producto_fabricado.precioVenta)
        resultado.append({
            "tipo": "Fabricación",
            "codigo": f"VAR-{v.id}",
            "producto": v.producto_fabricado.nombre,
            "variante": f"{v.talla} / {v.color}",
            "stock_actual": v.stockActual,
            "precio_venta": float(v.producto_fabricado.precioVenta),
            "valor_inventario_estimado": valor_total
        })
    
    for r in reventa:
        valor_total = float(r.stockActual) * float(r.precioVenta)
        resultado.append({
            "tipo": "Reventa",
            "codigo": f"REV-{r.id}",
            "producto": r.nombre,
            "variante": "N/A",
            "stock_actual": r.stockActual,
            "precio_venta": float(r.precioVenta),
            "valor_inventario_estimado": valor_total
        })
    
    return resultado

# --- REPORTE INVENTARIO MATERIA PRIMA ---
@router.get("/inventario-materia")
def reporte_inventario_materia(db: Session = Depends(get_db)):
    materiales = db.query(models.MateriaPrima).all()
    resultado = []
    for m in materiales:
        valor_total = float(m.stockActual) * float(m.costo)
        resultado.append({
            "id": m.id,
            "nombre": m.nombre,
            "proveedor": m.proveedor.nombre if m.proveedor else "Sin proveedor",
            "unidad": m.unidadMedida,
            "stock_actual": m.stockActual,
            "costo_unitario": float(m.costo),
            "valor_total_inversion": valor_total
        })
    return resultado