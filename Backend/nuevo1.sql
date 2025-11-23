-- Script de Creación de la Base de Datos "inventia_db"
-- compatible con PostgreSQL / SQLite

BEGIN;

-- 1. Tabla de Usuarios
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'operativo'))
);

-- 2. Tabla de Proveedores
CREATE TABLE Proveedor (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contacto VARCHAR(255)
);

-- 3. Tabla de Canales de Venta
CREATE TABLE CanalVenta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- 4. Tabla de Materia Prima
CREATE TABLE MateriaPrima (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    costo DECIMAL(10, 2) NOT NULL,
    unidadMedida VARCHAR(50) NOT NULL,
    stockActual INT NOT NULL DEFAULT 0,
    proveedor_id INT,
    FOREIGN KEY (proveedor_id) REFERENCES Proveedor(id)
);

-- 5. Tabla de Producto de Reventa
CREATE TABLE ProductoReventa (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    costoCompra DECIMAL(10, 2) NOT NULL,
    precioVenta DECIMAL(10, 2) NOT NULL,
    stockActual INT NOT NULL DEFAULT 0,
    proveedor_id INT,
    meli_id VARCHAR(50), -- NUEVO: ID de publicación en Mercado Libre
    FOREIGN KEY (proveedor_id) REFERENCES Proveedor(id)
);

-- 6. Tabla de Producto Fabricado (Plantilla Base)
CREATE TABLE ProductoFabricado (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precioVenta DECIMAL(10, 2) NOT NULL
);

-- 7. Tabla de Variantes de Producto
CREATE TABLE VarianteProducto (
    id SERIAL PRIMARY KEY,
    color VARCHAR(100),
    talla VARCHAR(50),
    stockActual INT NOT NULL DEFAULT 0,
    producto_fabricado_id INT NOT NULL,
    meli_id VARCHAR(50), -- NUEVO: ID de publicación en Mercado Libre
    FOREIGN KEY (producto_fabricado_id) REFERENCES ProductoFabricado(id)
        ON DELETE CASCADE
);

-- 8. Tabla de Lista de Materiales (BOM)
CREATE TABLE ListaMateriales (
    id SERIAL PRIMARY KEY,
    cantidadRequerida DECIMAL(10, 2) NOT NULL,
    producto_fabricado_id INT NOT NULL,
    materia_prima_id INT NOT NULL,
    FOREIGN KEY (producto_fabricado_id) REFERENCES ProductoFabricado(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_prima_id) REFERENCES MateriaPrima(id),
    UNIQUE(producto_fabricado_id, materia_prima_id)
);

-- 9. Tabla de Órdenes de Producción
CREATE TABLE OrdenProduccion (
    id SERIAL PRIMARY KEY,
    fechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fechaFinalizacion TIMESTAMP,
    cantidadProducida INT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    variante_producto_id INT NOT NULL,
    FOREIGN KEY (variante_producto_id) REFERENCES VarianteProducto(id)
);

-- 10. Tabla de Órdenes de Compra
CREATE TABLE OrdenCompra (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL,
    proveedor_id INT,
    FOREIGN KEY (proveedor_id) REFERENCES Proveedor(id)
);

-- 11. Tabla de Detalle de Órden de Compra
CREATE TABLE DetalleOrdenCompra (
    id SERIAL PRIMARY KEY,
    cantidad INT NOT NULL,
    costoUnitario DECIMAL(10, 2) NOT NULL,
    orden_compra_id INT NOT NULL,
    materia_prima_id INT,
    producto_reventa_id INT,
    FOREIGN KEY (orden_compra_id) REFERENCES OrdenCompra(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_prima_id) REFERENCES MateriaPrima(id),
    FOREIGN KEY (producto_reventa_id) REFERENCES ProductoReventa(id)
);

-- 12. Tabla de Órdenes de Venta
CREATE TABLE OrdenVenta (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL,
    canal_venta_id INT NOT NULL,
    usuario_id INT,
    FOREIGN KEY (canal_venta_id) REFERENCES CanalVenta(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
);

-- 13. Tabla de Detalle de Órden de Venta
CREATE TABLE DetalleOrdenVenta (
    id SERIAL PRIMARY KEY,
    cantidad INT NOT NULL,
    precioUnitario DECIMAL(10, 2) NOT NULL,
    orden_venta_id INT NOT NULL,
    variante_producto_id INT,
    producto_reventa_id INT,
    FOREIGN KEY (orden_venta_id) REFERENCES OrdenVenta(id) ON DELETE CASCADE,
    FOREIGN KEY (variante_producto_id) REFERENCES VarianteProducto(id),
    FOREIGN KEY (producto_reventa_id) REFERENCES ProductoReventa(id)
);

-- Inserta los canales de venta base
INSERT INTO CanalVenta (nombre) VALUES
('Mercado Libre'),
('Shein'),
('Walmart'),
('Amazon'),
('Temu');

COMMIT;