from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.get("/", response_model=List[schemas.UsuarioResponse])
def read_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

@router.post("/", response_model=schemas.UsuarioResponse)
def create_usuario(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # Verificar duplicados
    if db.query(models.Usuario).filter(models.Usuario.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    hashed_password = security.get_password_hash(user.password)
    db_user = models.Usuario(
        email=user.email,
        nombre=user.nombre,
        rol=user.rol,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}", response_model=schemas.UsuarioResponse)
def update_usuario(user_id: int, user_update: schemas.UsuarioUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = user_update.model_dump(exclude_unset=True)
    
    # Si viene password, hay que hashearla
    if 'password' in update_data:
        update_data['password_hash'] = security.get_password_hash(update_data.pop('password'))

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_usuario(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(db_user)
    db.commit()
    return {"ok": True}