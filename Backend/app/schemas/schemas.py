from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- Auth (Ya existía) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Esquemas de Usuario ---
class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str
    rol: str

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioResponse(UsuarioBase):
    id: int

# --- USUARIOS (Update) ---
class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None # Opcional para no obligar a cambiarla siempre
    rol: Optional[str] = None

# --- Proveedores ---
class ProveedorBase(BaseModel):
    nombre: str
    contacto: Optional[str] = None

class ProveedorCreate(ProveedorBase):
    pass

class ProveedorResponse(ProveedorBase):
    id: int
    class Config:
        from_attributes = True

# --- PROVEEDORES (Update - Faltaba) ---
class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    contacto: Optional[str] = None

# --- Producto Fabricado ---
class ProductoFabricadoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precioVenta: float

class ProductoFabricadoCreate(ProductoFabricadoBase):
    pass

class ProductoFabricadoResponse(ProductoFabricadoBase):
    id: int
    class Config:
        from_attributes = True

# --- Producto Reventa ---
class ProductoReventaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    costoCompra: float
    precioVenta: float
    stockActual: int
    proveedor_id: Optional[int] = None

class ProductoReventaCreate(ProductoReventaBase):
    pass

class ProductoReventaResponse(ProductoReventaBase):
    id: int
    proveedor: Optional[ProveedorResponse] = None
    class Config:
        from_attributes = True

# --- Esquemas del Dashboard (Coinciden con tu Frontend interface DashboardStats) ---
class DashboardStats(BaseModel):
    ventas_netas: float
    ordenes_pendientes: int
    tiempo_proceso: str
    canales_ok: str

# --- Materia Prima ---
class MateriaPrimaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    costo: float
    unidadMedida: str
    stockActual: int
    proveedor_id: Optional[int] = None

class MateriaPrimaCreate(MateriaPrimaBase):
    pass

class MateriaPrimaResponse(MateriaPrimaBase):
    id: int
    proveedor: Optional['ProveedorResponse'] = None # Forward reference si es necesario

    class Config:
        from_attributes = True

# --- Detalle Compra ---
class DetalleCompraBase(BaseModel):
    cantidad: int
    costoUnitario: float
    materia_prima_id: Optional[int] = None
    producto_reventa_id: Optional[int] = None

class DetalleCompraCreate(DetalleCompraBase):
    pass

class DetalleCompraResponse(DetalleCompraBase):
    id: int
    materia_prima: Optional['MateriaPrimaResponse'] = None
    producto_reventa: Optional['ProductoReventaResponse'] = None
    
    class Config:
        from_attributes = True

# --- Orden Compra ---
class OrdenCompraBase(BaseModel):
    proveedor_id: int
    estado: str = "Solicitada"

class OrdenCompraCreate(OrdenCompraBase):
    detalles: List[DetalleCompraCreate]

class OrdenCompraResponse(OrdenCompraBase):
    id: int
    fecha: datetime
    proveedor: Optional['ProveedorResponse'] = None
    detalles: List[DetalleCompraResponse] = []

    class Config:
        from_attributes = True

# --- Esquemas Auxiliares ---
class MateriaPrimaSimple(BaseModel):
    id: int
    nombre: str
    unidadMedida: str
    class Config:
        from_attributes = True

class ProductoFabricadoSimple(BaseModel):
    id: int
    nombre: str
    class Config:
        from_attributes = True

# --- Variantes ---
class VarianteBase(BaseModel):
    color: str
    talla: str
    stockActual: int = 0
    producto_fabricado_id: int

class VarianteCreate(VarianteBase):
    pass

class VarianteResponse(VarianteBase):
    id: int
    producto_fabricado: Optional[ProductoFabricadoSimple] = None
    class Config:
        from_attributes = True

# --- BOM (Lista Materiales) ---
class BOMBase(BaseModel):
    cantidadRequerida: float
    producto_fabricado_id: int
    materia_prima_id: int

class BOMCreate(BOMBase):
    pass

class BOMResponse(BOMBase):
    id: int
    materia_prima: Optional[MateriaPrimaSimple] = None
    class Config:
        from_attributes = True

# --- Orden Producción ---
class OrdenProduccionBase(BaseModel):
    cantidadProducida: int
    variante_producto_id: int
    estado: str = "En Proceso"

class OrdenProduccionCreate(OrdenProduccionBase):
    pass

class OrdenProduccionResponse(OrdenProduccionBase):
    id: int
    fechaCreacion: datetime
    fechaFinalizacion: Optional[datetime] = None
    variante: Optional[VarianteResponse] = None
    class Config:
        from_attributes = True

# --- ACTUALIZACIONES (NUEVO) ---
class MateriaPrimaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    costo: Optional[float] = None
    unidadMedida: Optional[str] = None
    stockActual: Optional[int] = None
    proveedor_id: Optional[int] = None

class ProductoFabricadoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precioVenta: Optional[float] = None

class ProductoReventaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    costoCompra: Optional[float] = None
    precioVenta: Optional[float] = None
    stockActual: Optional[int] = None
    proveedor_id: Optional[int] = None

class BOMUpdate(BaseModel):
    cantidadRequerida: float

# --- Auxiliares para Venta ---
class CanalVentaResponse(BaseModel):
    id: int
    nombre: str
    class Config:
        from_attributes = True

# --- Detalle Venta ---
class DetalleVentaBase(BaseModel):
    cantidad: int
    precioUnitario: float
    variante_producto_id: Optional[int] = None
    producto_reventa_id: Optional[int] = None

class DetalleVentaCreate(DetalleVentaBase):
    pass

class DetalleVentaResponse(DetalleVentaBase):
    id: int
    # Usamos esquemas que ya definiste antes o forward references
    variante: Optional['VarianteResponse'] = None 
    producto_reventa: Optional['ProductoReventaResponse'] = None
    class Config:
        from_attributes = True

# --- Orden Venta ---
class OrdenVentaCreate(BaseModel):
    canal_venta_id: int
    estado: str = "Pagada"
    detalles: List[DetalleVentaCreate]

class OrdenVentaResponse(BaseModel):
    id: int
    fecha: datetime
    estado: str
    canal: Optional[CanalVentaResponse] = None
    detalles: List[DetalleVentaResponse] = []
    
    class Config:
        from_attributes = True

# --- CANALES DE VENTA (CRUD) ---
class CanalVentaBase(BaseModel):
    nombre: str

class CanalVentaCreate(CanalVentaBase):
    pass

class CanalVentaUpdate(BaseModel):
    nombre: str

# --- IA & ANÁLISIS ---
class ProductoAnalisis(BaseModel):
    id: int
    nombre: str
    tipo: str
    stock_actual: int
    total_vendido: int
    estado_stock: str # 'Crítico', 'Bajo', 'Normal', 'Exceso'
    rotacion: str # 'Alta', 'Media', 'Baja', 'Nula'

class SugerenciaIA(BaseModel):
    titulo: str
    descripcion: str
    accion_sugerida: str # 'Descuento', 'Bundle', 'Reabastecer'
    producto_objetivo: str

class DashboardIAResponse(BaseModel):
    analisis_productos: List[ProductoAnalisis]
    sugerencias: List[SugerenciaIA]

class OrdenProduccionUpdate(BaseModel):
    estado: Optional[str] = None
    cantidadProducida: Optional[int] = None

class OrdenCompraUpdate(BaseModel):
    estado: Optional[str] = None
    proveedor_id: Optional[int] = None

class OrdenVentaUpdate(BaseModel):
    estado: Optional[str] = None
    canal_venta_id: Optional[int] = None
    # No permitimos editar detalles por simplicidad en esta iteración, solo estado

# --- MERCADO LIBRE ---

class MeLiItemBase(BaseModel):
    title: str
    category_id: str # Ej. MLM1055
    price: float
    currency_id: str = "MXN"
    available_quantity: int
    buying_mode: str = "buy_it_now"
    listing_type_id: str = "gold_special" # Clásica
    condition: str = "new"
    description: Optional[str] = None
    picture_url: Optional[str] = None

class MeLiPublishRequest(MeLiItemBase):
    # IDs internos para saber qué estamos publicando
    variante_id: Optional[int] = None
    reventa_id: Optional[int] = None

class MeLiUpdateRequest(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    available_quantity: Optional[int] = None
    status: Optional[str] = None # 'active', 'paused'

class ProductoSincronizacion(BaseModel):
    unique_id: str # "var-1" o "rev-2"
    tipo: str
    id_db: int
    nombre: str
    precio: float
    stock: int
    meli_id: Optional[str] = None # Si tiene valor, ya está publicado
    
    class Config:
        from_attributes = True