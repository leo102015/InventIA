from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import auth, dashboard, productos, materia_prima # Importamos productos

# Crear las tablas en la base de datos (si no existen)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="InventIA API", version="1.0.0")

# Configuración de CORS (Crucial para conectar con Next.js)
origins = [
    "http://localhost:3000",  # Tu frontend local
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(productos.router) # Agregamos el router
app.include_router(materia_prima.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de InventIA"}