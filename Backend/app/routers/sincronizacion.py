from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.core.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/sincronizacion", tags=["sincronizacion"])

# --- Obtener Lista Unificada de Productos para Sincronizar ---
@router.get("/productos", response_model=List[schemas.ProductoSincronizacion])
def get_productos_sincronizacion(db: Session = Depends(get_db)):
    lista = []
    
    # 1. Variantes
    variantes = db.query(models.VarianteProducto).all()
    for v in variantes:
        lista.append({
            "unique_id": f"var-{v.id}",
            "tipo": "Variante",
            "id_db": v.id,
            "nombre": f"{v.producto_fabricado.nombre} - {v.talla} {v.color}",
            "precio": v.producto_fabricado.precioVenta,
            "stock": v.stockActual,
            "meli_id": v.meli_id
        })
        
    # 2. Reventa
    reventa = db.query(models.ProductoReventa).all()
    for r in reventa:
        lista.append({
            "unique_id": f"rev-{r.id}",
            "tipo": "Reventa",
            "id_db": r.id,
            "nombre": r.nombre,
            "precio": r.precioVenta,
            "stock": r.stockActual,
            "meli_id": r.meli_id
        })
        
    return lista

# --- Publicar en Mercado Libre (Simulado) ---
@router.post("/mercadolibre/publicar")
def publicar_meli(data: schemas.MeLiPublishRequest, db: Session = Depends(get_db)):
    # Aquí iría la llamada real a: POST https://api.mercadolibre.com/items
    # body = data.dict() ... requests.post(url, json=body, headers=auth)
    
    # Simulamos respuesta exitosa de MeLi
    fake_meli_id = f"MLM-{uuid.uuid4().hex[:8].upper()}"
    
    # Guardar el ID en nuestra BD local
    if data.variante_id:
        prod = db.query(models.VarianteProducto).filter(models.VarianteProducto.id == data.variante_id).first()
        if prod: 
            prod.meli_id = fake_meli_id
            prod.stockActual = data.available_quantity # Sincronizar stock inicial si se desea
    
    elif data.reventa_id:
        prod = db.query(models.ProductoReventa).filter(models.ProductoReventa.id == data.reventa_id).first()
        if prod: 
            prod.meli_id = fake_meli_id
            prod.stockActual = data.available_quantity

    db.commit()
    return {"status": "success", "meli_id": fake_meli_id, "message": "Publicado correctamente en Mercado Libre"}

# --- Editar Publicación en MeLi ---
@router.put("/mercadolibre/{meli_id}")
def editar_meli(meli_id: str, data: schemas.MeLiUpdateRequest, db: Session = Depends(get_db)):
    # Aquí iría PUT https://api.mercadolibre.com/items/{meli_id}
    # Simulamos éxito
    
    # Actualizar localmente si cambiaron precio/stock
    # Nota: Esto requeriría buscar qué producto tiene ese meli_id.
    # Por simplicidad en este ejemplo, solo retornamos éxito.
    return {"status": "success", "message": f"Publicación {meli_id} actualizada"}

# --- Eliminar/Pausar Publicación ---
@router.delete("/mercadolibre/{unique_id}")
def eliminar_meli(unique_id: str, db: Session = Depends(get_db)):
    tipo, id_db = unique_id.split("-")
    id_db = int(id_db)
    
    meli_id_borrado = ""
    
    if tipo == "var":
        prod = db.query(models.VarianteProducto).filter(models.VarianteProducto.id == id_db).first()
        if prod:
            meli_id_borrado = prod.meli_id
            prod.meli_id = None # Desvincular
    elif tipo == "rev":
        prod = db.query(models.ProductoReventa).filter(models.ProductoReventa.id == id_db).first()
        if prod:
            meli_id_borrado = prod.meli_id
            prod.meli_id = None

    db.commit()
    # Aquí llamada a DELETE/PUT (closed) en API MeLi con meli_id_borrado
    return {"status": "success", "message": "Publicación eliminada/desvinculada"}