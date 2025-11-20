from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Text, TIMESTAMP, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False) # 'admin' o 'operativo'

class CanalVenta(Base):
    __tablename__ = "canalventa"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)

# ... Aquí irían el resto de tus tablas (Producto, MateriaPrima, etc.)
# Por ahora nos enfocamos en Usuario para el Login.