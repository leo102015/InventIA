from fastapi import APIRouter, Depends
from app.schemas import schemas
from app.models import models
from app.core import security

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(current_user: models.Usuario = Depends(security.get_current_user)):
    """
    Devuelve estadísticas para el dashboard. 
    Requiere autenticación (token JWT válido).
    """
    
    # Aquí conectarías con la DB real para hacer consultas SQL count/sum
    # Por ahora, devolvemos datos simulados dinámicos
    
    return {
        "ventas_netas": 15430.50,
        "ordenes_pendientes": 12,
        "tiempo_proceso": "4 min",
        "canales_ok": "4/5"
    }