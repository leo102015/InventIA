from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Text, TIMESTAMP, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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

# --- Producto Fabricado (Actualización: agregar relación) ---
class ProductoFabricado(Base):
    __tablename__ = "productofabricado"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    precioVenta = Column("precioventa", DECIMAL(10, 2), nullable=False)

    variantes = relationship("VarianteProducto", back_populates="producto_fabricado")
    bom = relationship("ListaMateriales", back_populates="producto_fabricado")

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

# --- Materia Prima ---
class MateriaPrima(Base):
    __tablename__ = "materiaprima"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    costo = Column(DECIMAL(10, 2), nullable=False)
    unidadMedida = Column("unidadmedida", String(50), nullable=False) # ej. 'metros', 'unidades'
    stockActual = Column("stockactual", Integer, nullable=False, default=0)
    proveedor_id = Column(Integer, ForeignKey("proveedor.id"))

    proveedor = relationship("Proveedor")

# --- Orden de Compra ---
class OrdenCompra(Base):
    __tablename__ = "ordencompra"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    estado = Column(String(50), nullable=False, default='Solicitada') # 'Solicitada', 'Recibida'
    proveedor_id = Column(Integer, ForeignKey("proveedor.id"))

    proveedor = relationship("Proveedor")
    detalles = relationship("DetalleOrdenCompra", back_populates="orden_compra")

# --- Detalle Orden de Compra ---
class DetalleOrdenCompra(Base):
    __tablename__ = "detalleordencompra"

    id = Column(Integer, primary_key=True, index=True)
    cantidad = Column(Integer, nullable=False)
    costoUnitario = Column("costounitario", DECIMAL(10, 2), nullable=False)
    orden_compra_id = Column("orden_compra_id", Integer, ForeignKey("ordencompra.id"))
    
    # Polimorfismo: puede ser materia prima O producto de reventa
    materia_prima_id = Column("materia_prima_id", Integer, ForeignKey("materiaprima.id"), nullable=True)
    producto_reventa_id = Column("producto_reventa_id", Integer, ForeignKey("productoreventa.id"), nullable=True)

    orden_compra = relationship("OrdenCompra", back_populates="detalles")
    materia_prima = relationship("MateriaPrima")
    producto_reventa = relationship("ProductoReventa")

# --- Variante de Producto (Talla/Color) ---
class VarianteProducto(Base):
    __tablename__ = "varianteproducto"
    id = Column(Integer, primary_key=True, index=True)
    color = Column(String(100))
    talla = Column(String(50))
    stockActual = Column("stockactual", Integer, nullable=False, default=0)
    producto_fabricado_id = Column("producto_fabricado_id", Integer, ForeignKey("productofabricado.id"), nullable=False)

    producto_fabricado = relationship("ProductoFabricado", back_populates="variantes")

# --- Lista de Materiales (BOM - Receta) ---
class ListaMateriales(Base):
    __tablename__ = "listamateriales"
    id = Column(Integer, primary_key=True, index=True)
    cantidadRequerida = Column("cantidadrequerida", DECIMAL(10, 2), nullable=False)
    producto_fabricado_id = Column("producto_fabricado_id", Integer, ForeignKey("productofabricado.id"), nullable=False)
    materia_prima_id = Column("materia_prima_id", Integer, ForeignKey("materiaprima.id"), nullable=False)

    producto_fabricado = relationship("ProductoFabricado", back_populates="bom")
    materia_prima = relationship("MateriaPrima")

    __table_args__ = (UniqueConstraint('producto_fabricado_id', 'materia_prima_id', name='_producto_materia_uc'),)

# --- Orden de Producción ---
class OrdenProduccion(Base):
    __tablename__ = "ordenproduccion"
    id = Column(Integer, primary_key=True, index=True)
    fechaCreacion = Column("fechacreacion", TIMESTAMP, server_default=func.now(), nullable=False)
    fechaFinalizacion = Column("fechafinalizacion", TIMESTAMP, nullable=True)
    cantidadProducida = Column("cantidadproducida", Integer, nullable=False)
    estado = Column(String(50), nullable=False, default='En Proceso') # 'En Proceso', 'Terminado'
    variante_producto_id = Column("variante_producto_id", Integer, ForeignKey("varianteproducto.id"), nullable=False)

    variante = relationship("VarianteProducto")