from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Annotated, Generator
from datetime import datetime, timedelta, timezone

# --- Importaciones de Seguridad ---
import jwt
from passlib.context import CryptContext

# --- Importaciones de Base de Datos ---
from sqlalchemy import create_engine, Column, Integer, String, Boolean, MetaData, Table
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from sqlalchemy.ext.declarative import declarative_base

# --- 1. CONFIGURACIÓN DE BASE DE DATOS ---
# Conecta a tu base de datos Docker (usuario:inventia_user, pass:tall3r_1nvent14, db:inventia_db)
SQLALCHEMY_DATABASE_URL = "postgresql://inventia_user:tall3r_1nvent14@localhost:5432/inventia_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. CONFIGURACIÓN DE SEGURIDAD ---
# Usamos bcrypt para hashear contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# ESTA CLAVE DEBE SER SECRETA Y ESTAR EN UN .env EN PRODUCCIÓN
SECRET_KEY = "T4ll3r_1nvent14_2025_PCL_y_LBDI"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # El token durará 1 hora

# --- 3. MODELOS DE BASE DE DATOS (SQLAlchemy) ---
# Definimos la tabla 'usuario' que ya creaste en la DB
class Usuario(Base):
    __tablename__ = "usuario"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False) # El nombre coincide con tu SQL
    rol = Column(String(50), nullable=False)

# --- 4. ESQUEMAS (Pydantic) ---
# Sirven para validar los datos que entran y salen de la API
class UserSchema(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str
    
    class Config:
        orm_mode = True # Permite que Pydantic lea modelos de SQLAlchemy

class UserCreate(BaseModel):
    nombre: str
    email: str
    password: str # Recibimos la contraseña en texto plano
    rol: str = "operativo" # Rol por defecto

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

# --- 5. FUNCIONES DE UTILIDAD (Dependencias y Seguridad) ---
def get_db() -> Generator[Session, None, None]:
    """Generador de sesión de base de datos para las rutas."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Alias para la dependencia de la sesión de DB
db_dependency = Annotated[Session, Depends(get_db)]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña plana contra un hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashea una contraseña."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Crea un nuevo token de acceso JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- 6. FUNCIONES CRUD (Base de Datos) ---
def get_user_by_email(db: Session, email: str) -> Usuario | None:
    """Busca un usuario por su email."""
    return db.query(Usuario).filter(Usuario.email == email).first()

def create_user(db: Session, user: UserCreate) -> Usuario:
    """Crea un nuevo usuario en la DB."""
    hashed_password = get_password_hash(user.password)
    db_user = Usuario(
        email=user.email, 
        nombre=user.nombre, 
        password_hash=hashed_password, 
        rol=user.rol
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- 7. INICIALIZACIÓN DE LA APP FASTAPI ---
app = FastAPI(title="InventIA API", version="0.1.0")

# --- 8. MIDDLEWARE (CORS) ---
# VITAL para que tu frontend en localhost:3000 pueda hablar con el backend en localhost:8000
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 9. ENDPOINTS (Rutas de la API) ---

@app.get("/")
def read_root():
    return {"InventIA": "API está funcionando y conectada a PostgreSQL"}

@app.post("/create-user", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register_new_user(user: UserCreate, db: db_dependency):
    """
    Endpoint para crear un nuevo usuario.
    Usarás esto UNA VEZ para crear tu usuario admin.
    """
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    return create_user(db=db, user=user)

@app.post("/token", response_model=Token)
async def login_for_access_token(
    db: db_dependency,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """
    Endpoint de Login. Valida usuario y contraseña.
    Espera 'username' (tu email) y 'password' en un formulario.
    """
    user = get_user_by_email(db, email=form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Si es válido, crea el token JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "rol": user.rol}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# --- Cómo ejecutar la app ---
# En tu terminal, con (venv) activado, en la carpeta Backend:
# uvicorn main:app --reload --port 8000