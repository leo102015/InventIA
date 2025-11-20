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
import { PlusCircle, Loader2, RefreshCw, Eye, Package, DollarSign, Factory, Store } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Proveedor {
  id: number;
  nombre: string;
}

interface Variante {
    id: number;
    color: string;
    talla: string;
    stockActual: number;
    producto_fabricado_id: number;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precioVenta: number;
  tipo: "Fabricación" | "Reventa";
  stockActual?: number; // Para reventa
  costoCompra?: number;
  proveedor?: Proveedor;
  variantes?: Variante[]; // Nuevo campo para frontend
}

export default function InventarioProductoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("fabricacion");
  const [formData, setFormData] = useState({
    nombre: "", descripcion: "", precioVenta: "", costoCompra: "", stockActual: "", proveedor_id: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("inventia_token");
      const headers = { 'Authorization': `Bearer ${token}` };

      // Cargar todo
      const [resFab, resRev, resProv, resVar] = await Promise.all([
          fetch("http://127.0.0.1:8000/productos/fabricados", { headers }),
          fetch("http://127.0.0.1:8000/productos/reventa", { headers }),
          fetch("http://127.0.0.1:8000/productos/proveedores", { headers }),
          fetch("http://127.0.0.1:8000/produccion/variantes", { headers })
      ]);

      const dataFab = await resFab.json();
      const dataRev = await resRev.json();
      const dataProv = await resProv.json();
      const dataVar: Variante[] = await resVar.json();

      // Mapear variantes a productos fabricados
      const listaFab = dataFab.map((p: any) => {
          const variantesDelProd = dataVar.filter(v => v.producto_fabricado_id === p.id);
          const stockTotal = variantesDelProd.reduce((acc, v) => acc + v.stockActual, 0);
          return { 
              ...p, 
              tipo: "Fabricación", 
              variantes: variantesDelProd,
              stockActual: stockTotal 
          };
      });

      const listaRev = dataRev.map((p: any) => ({ ...p, tipo: "Reventa" }));
      
      setProductos([...listaFab, ...listaRev]);
      setProveedores(dataProv);

    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    const token = localStorage.getItem("inventia_token");
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    try {
        let url = activeTab === "fabricacion" ? "http://127.0.0.1:8000/productos/fabricados" : "http://127.0.0.1:8000/productos/reventa";
        let body: any = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            precioVenta: parseFloat(formData.precioVenta)
        };
        if (activeTab === "reventa") {
            body = { ...body, costoCompra: parseFloat(formData.costoCompra), stockActual: parseInt(formData.stockActual), proveedor_id: parseInt(formData.proveedor_id) };
        }

        const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        if (!response.ok) throw new Error("Error al guardar producto");

        setCreateDialogOpen(false);
        setFormData({ nombre: "", descripcion: "", precioVenta: "", costoCompra: "", stockActual: "", proveedor_id: "" });
        fetchData();
    } catch (err: any) { setError(err.message); } finally { setIsSaving(false); }
  };

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
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader><DialogTitle>Agregar Nuevo Producto</DialogTitle><DialogDescription>Los productos se guardarán en la BD.</DialogDescription></DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fabricacion">Fabricación Propia</TabsTrigger>
                  <TabsTrigger value="reventa">Reventa</TabsTrigger>
                </TabsList>
                <TabsContent value="fabricacion">
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        <Input placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                        <Input type="number" placeholder="Precio Venta" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: e.target.value})} />
                        <Button onClick={handleSubmit} disabled={isSaving}>Guardar</Button>
                    </div>
                </TabsContent>
                <TabsContent value="reventa">
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        <Select onValueChange={v => setFormData({...formData, proveedor_id: v})}>
                            <SelectTrigger><SelectValue placeholder="Proveedor" /></SelectTrigger>
                            <SelectContent>{proveedores.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input type="number" placeholder="Costo Compra" value={formData.costoCompra} onChange={e => setFormData({...formData, costoCompra: e.target.value})} />
                        <Input type="number" placeholder="Precio Venta" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: e.target.value})} />
                        <Input type="number" placeholder="Stock Inicial" value={formData.stockActual} onChange={e => setFormData({...formData, stockActual: e.target.value})} />
                        <Button onClick={handleSubmit} disabled={isSaving}>Guardar</Button>
                    </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>Detalles del Producto</DialogTitle></DialogHeader>
            {selectedProduct && (
                <div className="grid gap-4 py-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">{selectedProduct.nombre}</h3>
                        <Badge>{selectedProduct.tipo}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <p><strong>Precio Venta:</strong> ${selectedProduct.precioVenta.toFixed(2)}</p>
                        <p><strong>Total Stock:</strong> {selectedProduct.stockActual}</p>
                        <p className="col-span-2 text-sm text-gray-500">{selectedProduct.descripcion}</p>
                    </div>

                    {selectedProduct.tipo === "Fabricación" && selectedProduct.variantes && (
                        <div className="border rounded-md p-2 mt-2 bg-gray-50">
                            <h4 className="font-semibold mb-2 text-sm">Desglose de Variantes</h4>
                            <Table>
                                <TableHeader><TableRow><TableHead>Talla</TableHead><TableHead>Color</TableHead><TableHead className="text-right">Stock</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {selectedProduct.variantes.length > 0 ? selectedProduct.variantes.map(v => (
                                        <TableRow key={v.id}>
                                            <TableCell>{v.talla}</TableCell>
                                            <TableCell>{v.color}</TableCell>
                                            <TableCell className="text-right font-bold">{v.stockActual}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="text-center text-xs">Sin variantes registradas</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Stock Total</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acciones</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {productos.map((prod) => (
                  <TableRow key={prod.id}>
                  <TableCell>{prod.id}</TableCell>
                  <TableCell className="font-medium">{prod.nombre}</TableCell>
                  <TableCell><Badge variant={prod.tipo === 'Fabricación' ? 'default' : 'secondary'}>{prod.tipo}</Badge></TableCell>
                  <TableCell className={prod.stockActual === 0 ? "text-red-500 font-bold" : "font-bold"}>{prod.stockActual}</TableCell>
                  <TableCell>${prod.precioVenta.toFixed(2)}</TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => handleViewDetails(prod)}><Eye className="w-4 h-4 mr-1" /> Detalles</Button></TableCell>
                  </TableRow>
              ))}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}