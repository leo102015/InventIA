"use client";
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ScanBarcode, Loader2, RefreshCw, Eye, Package, DollarSign, Factory, Store } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@radix-ui/react-dropdown-menu";

// Interfaces que coinciden con el Backend
interface Proveedor {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precioVenta: number;
  tipo: "Fabricación" | "Reventa";
  // Campos específicos de reventa
  stockActual?: number;
  costoCompra?: number;
  proveedor?: Proveedor;
}

export default function InventarioProductoPage() {
  // Estados de datos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // --- NUEVO: Estados para el modal de Detalles ---
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados del Formulario de Creación
  const [activeTab, setActiveTab] = useState("fabricacion");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precioVenta: "",
    // Reventa
    costoCompra: "",
    stockActual: "",
    proveedor_id: ""
  });

  // --- Cargar Datos Iniciales ---
  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("inventia_token");
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Cargar Fabricados
      const resFab = await fetch("http://127.0.0.1:8000/productos/fabricados", { headers });
      const dataFab = await resFab.json();

      // 2. Cargar Reventa
      const resRev = await fetch("http://127.0.0.1:8000/productos/reventa", { headers });
      const dataRev = await resRev.json();

      // 3. Cargar Proveedores (para el select)
      const resProv = await fetch("http://127.0.0.1:8000/productos/proveedores", { headers });
      const dataProv = await resProv.json();

      // Unificar listas para la tabla
      const listaFab = dataFab.map((p: any) => ({ ...p, tipo: "Fabricación", stockActual: "N/A" })); // stockActual N/A temporalmente hasta tener Variantes
      const listaRev = dataRev.map((p: any) => ({ ...p, tipo: "Reventa" }));
      
      setProductos([...listaFab, ...listaRev]);
      setProveedores(dataProv);

    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos. Verifica que el backend esté corriendo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Manejar Envío del Formulario ---
  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    
    const token = localStorage.getItem("inventia_token");
    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    try {
        let url = "";
        let body = {};

        if (activeTab === "fabricacion") {
            url = "http://127.0.0.1:8000/productos/fabricados";
            body = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precioVenta: parseFloat(formData.precioVenta)
            };
        } else {
            url = "http://127.0.0.1:8000/productos/reventa";
            body = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                precioVenta: parseFloat(formData.precioVenta),
                costoCompra: parseFloat(formData.costoCompra),
                stockActual: parseInt(formData.stockActual),
                proveedor_id: parseInt(formData.proveedor_id)
            };
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Error al guardar producto");
        }

        // Éxito
        setSuccess("Producto guardado correctamente");
        setFormData({ nombre: "", descripcion: "", precioVenta: "", costoCompra: "", stockActual: "", proveedor_id: "" });
        setCreateDialogOpen(false); // Cerrar modal de creación
        fetchData(); // Recargar tabla

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  // --- Función para abrir detalles ---
  const handleViewDetails = (producto: Producto) => {
    setSelectedProduct(producto);
    setDetailsDialogOpen(true);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 Inventario de Producto Terminado</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          {/* --- DIALOGO DE CREACIÓN --- */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Los productos se guardarán directamente en la base de datos.
                </DialogDescription>
              </DialogHeader>

              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fabricacion">Fabricación Propia</TabsTrigger>
                  <TabsTrigger value="reventa">Reventa</TabsTrigger>
                </TabsList>
                
                {/* Formulario Fabricación */}
                <TabsContent value="fabricacion">
                  <div className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-fab-nombre" className="text-right">Nombre</Label>
                      <Input 
                        id="prod-fab-nombre" 
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="col-span-3" 
                        placeholder="Ej. Pijama Quirúrgica"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-fab-desc" className="text-right">Descripción</Label>
                      <Input 
                        id="prod-fab-desc" 
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        className="col-span-3" 
                        placeholder="Detalles opcionales"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-fab-precio" className="text-right">Precio Venta</Label>
                      <Input 
                        id="prod-fab-precio" 
                        type="number" 
                        value={formData.precioVenta}
                        onChange={(e) => setFormData({...formData, precioVenta: e.target.value})}
                        className="col-span-3" 
                        placeholder="0.00"
                      />
                    </div>
                    <Button className="mt-4" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                        Guardar Producto Base
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Formulario Reventa */}
                <TabsContent value="reventa">
                  <div className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-nombre" className="text-right">Nombre</Label>
                      <Input 
                        id="prod-rev-nombre" 
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="col-span-3" 
                      />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-proveedor" className="text-right">Proveedor</Label>
                      <Select 
                        onValueChange={(val) => setFormData({...formData, proveedor_id: val})}
                      >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar Proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                            {proveedores.map((prov) => (
                                <SelectItem key={prov.id} value={prov.id.toString()}>
                                    {prov.nombre}
                                </SelectItem>
                            ))}
                            {proveedores.length === 0 && <SelectItem value="0" disabled>Sin proveedores registrados</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-costo" className="text-right">Costo Compra</Label>
                      <Input 
                        id="prod-rev-costo" 
                        type="number" 
                        value={formData.costoCompra}
                        onChange={(e) => setFormData({...formData, costoCompra: e.target.value})}
                        className="col-span-3" 
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-precio" className="text-right">Precio Venta</Label>
                      <Input 
                        id="prod-rev-precio" 
                        type="number" 
                        value={formData.precioVenta}
                        onChange={(e) => setFormData({...formData, precioVenta: e.target.value})}
                        className="col-span-3" 
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-stock" className="text-right">Stock Inicial</Label>
                      <Input 
                        id="prod-rev-stock" 
                        type="number" 
                        value={formData.stockActual}
                        onChange={(e) => setFormData({...formData, stockActual: e.target.value})}
                        className="col-span-3" 
                      />
                    </div>
                    <Button className="mt-4" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                        Guardar Producto Reventa
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- DIALOGO DE DETALLES --- */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Detalles del Producto</DialogTitle>
                <DialogDescription>
                    Información completa registrada en el sistema.
                </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            {selectedProduct.tipo === "Fabricación" ? <Factory className="text-blue-500" /> : <Store className="text-green-500" />}
                            {selectedProduct.nombre}
                        </h3>
                        <Badge variant={selectedProduct.tipo === 'Fabricación' ? 'default' : 'secondary'}>
                            {selectedProduct.tipo}
                        </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground font-semibold">ID Sistema:</span>
                            <span>#{selectedProduct.id}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground font-semibold">Precio Venta:</span>
                            <span className="text-lg font-bold text-green-700">${selectedProduct.precioVenta.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1 bg-gray-50 p-3 rounded-md border">
                        <span className="text-muted-foreground font-semibold text-xs uppercase">Descripción:</span>
                        <p className="text-sm text-gray-700">{selectedProduct.descripcion || "Sin descripción."}</p>
                    </div>

                    {/* Información Específica por Tipo */}
                    {selectedProduct.tipo === "Reventa" && (
                        <div className="grid grid-cols-2 gap-4 mt-2 border-t pt-4">
                            <div className="flex flex-col space-y-1">
                                <span className="text-muted-foreground font-semibold flex items-center gap-1"><DollarSign size={14}/> Costo Compra:</span>
                                <span>${selectedProduct.costoCompra?.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-muted-foreground font-semibold flex items-center gap-1"><Package size={14}/> Stock Actual:</span>
                                <span>{selectedProduct.stockActual} unidades</span>
                            </div>
                            <div className="col-span-2 flex flex-col space-y-1">
                                <span className="text-muted-foreground font-semibold">Proveedor:</span>
                                <span className="font-medium">{selectedProduct.proveedor?.nombre || "No asignado"}</span>
                            </div>
                        </div>
                    )}

                    {selectedProduct.tipo === "Fabricación" && (
                        <div className="mt-2 border-t pt-4">
                            <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                                <Factory size={16} />
                                Este producto se fabrica internamente. El stock depende de las variantes (Talla/Color) producidas.
                            </p>
                        </div>
                    )}
                </div>
            )}
            <DialogFooter>
                <Button variant="secondary" onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabla de Productos */}
      <Card>
        <CardHeader>
          <CardTitle>Listado General de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
          ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Precio Venta</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {productos.map((prod) => (
                    <TableRow key={`${prod.tipo}-${prod.id}`}>
                    <TableCell>{prod.id}</TableCell>
                    <TableCell className="font-medium">{prod.nombre}</TableCell>
                    <TableCell>
                        <Badge variant={prod.tipo === 'Fabricación' ? 'default' : 'secondary'}>{prod.tipo}</Badge>
                    </TableCell>
                    <TableCell>{prod.stockActual}</TableCell>
                    <TableCell>${prod.precioVenta.toFixed(2)}</TableCell>
                    <TableCell>{prod.proveedor ? prod.proveedor.nombre : '-'}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(prod)} // <--- Conectamos el botón aquí
                        >
                            <Eye className="w-4 h-4 mr-1 text-gray-500" />
                            Detalles
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                {productos.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                            No hay productos registrados aún.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}