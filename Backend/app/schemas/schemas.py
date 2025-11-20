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