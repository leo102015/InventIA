from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Text, TIMESTAMP, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

# --- Usuarios (Ya existía) ---
class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)

# --- Proveedores ---
class Proveedor(Base):
    __tablename__ = "proveedor"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    contacto = Column(String(255))

# --- Productos ---
class ProductoFabricado(Base):
    __tablename__ = "productofabricado"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    precioVenta = Column("precioventa", DECIMAL(10, 2), nullable=False) # PostgreSQL suele bajar a minúsculas

    # Relación con variantes (se definirá cuando hagamos la tabla Variantes)

class ProductoReventa(Base):
    __tablename__ = "productoreventa"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    costoCompra = Column("costocompra", DECIMAL(10, 2), nullable=False)
    precioVenta = Column("precioventa", DECIMAL(10, 2), nullable=False)
    stockActual = Column("stockactual", Integer, nullable=False, default=0)
    proveedor_id = Column(Integer, ForeignKey("proveedor.id"))

    proveedor = relationship("Proveedor")