from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(
    prefix="/productos",
    tags=["productos"]
)

# --- PROVEEDORES (Auxiliar para el dropdown) ---
@router.get("/proveedores", response_model=List[schemas.ProveedorResponse])
def get_proveedores(db: Session = Depends(get_db)):
    return db.query(models.Proveedor).all()

@router.post("/proveedores", response_model=schemas.ProveedorResponse)
def create_proveedor(proveedor: schemas.ProveedorCreate, db: Session = Depends(get_db)):
    db_prov = models.Proveedor(**proveedor.model_dump())
    db.add(db_prov)
    db.commit()
    db.refresh(db_prov)
    return db_prov

# --- FABRICACIÓN ---
@router.post("/fabricados", response_model=schemas.ProductoFabricadoResponse)
def create_producto_fabricado(
    producto: schemas.ProductoFabricadoCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(security.get_current_user) # Requiere login
):
    db_prod = models.ProductoFabricado(**producto.model_dump())
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

@router.get("/fabricados", response_model=List[schemas.ProductoFabricadoResponse])
def read_productos_fabricados(db: Session = Depends(get_db)):
    return db.query(models.ProductoFabricado).all()

# NUEVO: Editar Fabricado
@router.put("/fabricados/{id}", response_model=schemas.ProductoFabricadoResponse)
def update_producto_fabricado(id: int, producto: schemas.ProductoFabricadoUpdate, db: Session = Depends(get_db)):
    db_prod = db.query(models.ProductoFabricado).filter(models.ProductoFabricado.id == id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    for key, value in producto.model_dump(exclude_unset=True).items():
        setattr(db_prod, key, value)
    
    db.commit()
    db.refresh(db_prod)
    return db_prod

# NUEVO: Eliminar Fabricado
@router.delete("/fabricados/{id}")
def delete_producto_fabricado(id: int, db: Session = Depends(get_db)):
    db_prod = db.query(models.ProductoFabricado).filter(models.ProductoFabricado.id == id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(db_prod)
    db.commit()
    return {"ok": True}

# --- REVENTA ---
@router.post("/reventa", response_model=schemas.ProductoReventaResponse)
def create_producto_reventa(
    producto: schemas.ProductoReventaCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    db_prod = models.ProductoReventa(**producto.model_dump())
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

@router.get("/reventa", response_model=List[schemas.ProductoReventaResponse])
def read_productos_reventa(db: Session = Depends(get_db)):
    return db.query(models.ProductoReventa).all()

# NUEVO: Editar Reventa
@router.put("/reventa/{id}", response_model=schemas.ProductoReventaResponse)
def update_producto_reventa(id: int, producto: schemas.ProductoReventaUpdate, db: Session = Depends(get_db)):
    db_prod = db.query(models.ProductoReventa).filter(models.ProductoReventa.id == id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    for key, value in producto.model_dump(exclude_unset=True).items():
        setattr(db_prod, key, value)
    
    db.commit()
    db.refresh(db_prod)
    return db_prod

# NUEVO: Eliminar Reventa
@router.delete("/reventa/{id}")
def delete_producto_reventa(id: int, db: Session = Depends(get_db)):
    db_prod = db.query(models.ProductoReventa).filter(models.ProductoReventa.id == id).first()
    if not db_prod:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(db_prod)
    db.commit()
    return {"ok": True}

# NUEVO: Editar Proveedor
@router.put("/proveedores/{id}", response_model=schemas.ProveedorResponse)
def update_proveedor(id: int, proveedor: schemas.ProveedorUpdate, db: Session = Depends(get_db)):
    db_prov = db.query(models.Proveedor).filter(models.Proveedor.id == id).first()
    if not db_prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    for key, value in proveedor.model_dump(exclude_unset=True).items():
        setattr(db_prov, key, value)
    
    db.commit()
    db.refresh(db_prov)
    return db_prov

# NUEVO: Eliminar Proveedor
@router.delete("/proveedores/{id}")
def delete_proveedor(id: int, db: Session = Depends(get_db)):
    db_prov = db.query(models.Proveedor).filter(models.Proveedor.id == id).first()
    if not db_prov:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    try:
        db.delete(db_prov)
        db.commit()
    except Exception:
        # Capturar error de integridad (si el proveedor tiene productos asignados)
        db.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar: El proveedor tiene productos o historial asociado.")
    
    return {"ok": True}