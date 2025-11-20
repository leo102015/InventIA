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