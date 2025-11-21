from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core import ai_service, security
from app.schemas import schemas

router = APIRouter(
    prefix="/ia",
    tags=["ia"]
)

@router.get("/analisis", response_model=schemas.DashboardIAResponse)
def get_analisis_ia(
    db: Session = Depends(get_db),
    current_user = Depends(security.get_current_user)
):
    analisis, sugerencias = ai_service.analizar_inventario(db)
    return {
        "analisis_productos": analisis,
        "sugerencias": sugerencias
    }