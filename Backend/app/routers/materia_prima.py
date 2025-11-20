from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(
    prefix="/materia-prima",
    tags=["materia-prima"]
)

@router.post("/", response_model=schemas.MateriaPrimaResponse)
def create_materia_prima(
    material: schemas.MateriaPrimaCreate, 
    db: Session = Depends(get_db),
    current_user: models.Usuario = Depends(security.get_current_user)
):
    db_mat = models.MateriaPrima(**material.model_dump())
    db.add(db_mat)
    db.commit()
    db.refresh(db_mat)
    return db_mat

@router.get("/", response_model=List[schemas.MateriaPrimaResponse])
def read_materia_prima(db: Session = Depends(get_db)):
    return db.query(models.MateriaPrima).all()

# Endpoint para obtener detalles de un material específico
@router.get("/{material_id}", response_model=schemas.MateriaPrimaResponse)
def read_materia_prima_by_id(material_id: int, db: Session = Depends(get_db)):
    material = db.query(models.MateriaPrima).filter(models.MateriaPrima.id == material_id).first()
    if material is None:
        raise HTTPException(status_code=404, detail="Material no encontrado")
    return material