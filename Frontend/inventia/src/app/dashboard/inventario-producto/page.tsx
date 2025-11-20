"use client";
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
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
import { PlusCircle, Loader2, RefreshCw, Eye, Pencil, Trash2, Factory, Store, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- Interfaces ---
interface Proveedor { id: number; nombre: string; }
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
  stockActual?: number;
  costoCompra?: number;
  proveedor?: Proveedor;
  proveedor_id?: number; 
  variantes?: Variante[]; // Lista de variantes para productos fabricados
}

export default function InventarioProductoPage() {
  // --- Estados ---
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modales
  const [dialogOpen, setDialogOpen] = useState(false); 
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  
  // Edición
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("fabricacion");
  const [error, setError] = useState("");
  
  // Formulario
  const [formData, setFormData] = useState({
    nombre: "", descripcion: "", precioVenta: "", costoCompra: "", stockActual: "", proveedor_id: ""
  });

  // --- Carga de Datos ---
  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("inventia_token");
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Peticiones en paralelo para optimizar
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

      // Procesar Fabricados: Unir con sus variantes y calcular stock total
      const listaFab = dataFab.map((p: any) => {
          const variantesDelProd = dataVar.filter(v => v.producto_fabricado_id === p.id);
          const stockTotal = variantesDelProd.reduce((acc, v) => acc + v.stockActual, 0);
          return { 
              ...p, 
              tipo: "Fabricación", 
              variantes: variantesDelProd, // Guardamos las variantes aquí
              stockActual: stockTotal 
          };
      });

      // Procesar Reventa
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

  // --- Handlers del Formulario (Crear/Editar) ---
  const handleOpenCreate = () => {
      setIsEditing(false);
      setFormData({ nombre: "", descripcion: "", precioVenta: "", costoCompra: "", stockActual: "", proveedor_id: "" });
      setDialogOpen(true);
  };

  const handleEdit = (prod: Producto) => {
      setIsEditing(true);
      setCurrentId(prod.id);
      setActiveTab(prod.tipo === "Fabricación" ? "fabricacion" : "reventa");
      setFormData({
          nombre: prod.nombre,
          descripcion: prod.descripcion || "",
          precioVenta: prod.precioVenta.toString(),
          costoCompra: prod.costoCompra?.toString() || "",
          stockActual: prod.stockActual?.toString() || "",
          proveedor_id: prod.proveedor_id?.toString() || (prod.proveedor?.id.toString() || "")
      });
      setDialogOpen(true);
  };

  const handleDelete = async (id: number, tipo: string) => {
      if (!confirm("¿Estás seguro de eliminar este producto?")) return;
      const token = localStorage.getItem("inventia_token");
      const endpoint = tipo === "Fabricación" ? "fabricados" : "reventa";
      try {
          await fetch(`http://127.0.0.1:8000/productos/${endpoint}/${id}`, {
              method: "DELETE",
              headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchData();
      } catch (err) { alert("Error eliminando producto"); }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    const token = localStorage.getItem("inventia_token");
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
        let endpoint = activeTab === "fabricacion" ? "fabricados" : "reventa";
        let url = `http://127.0.0.1:8000/productos/${endpoint}`;
        if (isEditing) url += `/${currentId}`;

        let body: any = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            precioVenta: parseFloat(formData.precioVenta)
        };
        
        if (activeTab === "reventa") {
            body = { 
                ...body, 
                costoCompra: parseFloat(formData.costoCompra), 
                stockActual: parseInt(formData.stockActual), 
                proveedor_id: parseInt(formData.proveedor_id) 
            };
        }

        const response = await fetch(url, { 
            method: isEditing ? "PUT" : "POST", 
            headers, 
            body: JSON.stringify(body) 
        });
        
        if (!response.ok) throw new Error("Error al guardar");

        setDialogOpen(false);
        fetchData();
    } catch (err: any) { setError(err.message); } finally { setIsSaving(false); }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 Inventario de Producto</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
          <Button onClick={handleOpenCreate}><PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto</Button>
        </div>
      </div>

      {/* --- MODAL CREAR/EDITAR --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {!isEditing && (
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="fabricacion">Fabricación Propia</TabsTrigger>
                    <TabsTrigger value="reventa">Reventa</TabsTrigger>
                </TabsList>
            )}
            
            <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Nombre</Label>
                    <Input className="col-span-3" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Descripción</Label>
                    <Input className="col-span-3" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Precio Venta</Label>
                    <Input type="number" className="col-span-3" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: e.target.value})} />
                </div>

                {activeTab === "reventa" && (
                    <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Proveedor</Label>
                            <Select value={formData.proveedor_id} onValueChange={v => setFormData({...formData, proveedor_id: v})}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                <SelectContent>{proveedores.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Costo Compra</Label>
                            <Input type="number" className="col-span-3" value={formData.costoCompra} onChange={e => setFormData({...formData, costoCompra: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Stock Inicial</Label>
                            <Input type="number" className="col-span-3" value={formData.stockActual} onChange={e => setFormData({...formData, stockActual: e.target.value})} />
                        </div>
                    </>
                )}
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin mr-2"/> : "Guardar"}</Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DETALLES --- */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
             <DialogHeader><DialogTitle>Detalles del Producto</DialogTitle></DialogHeader>
             {selectedProduct && (
                 <div className="grid gap-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">{selectedProduct.nombre}</h3>
                        <Badge>{selectedProduct.tipo}</Badge>
                     </div>
                     <p className="text-gray-600 text-sm">{selectedProduct.descripcion || "Sin descripción"}</p>
                     
                     <div className="grid grid-cols-2 gap-4 border-t pt-4">
                         <div>
                             <span className="text-xs text-gray-500 font-semibold uppercase">Precio Venta</span>
                             <p className="text-lg font-bold text-green-700">${selectedProduct.precioVenta}</p>
                         </div>
                         <div>
                             <span className="text-xs text-gray-500 font-semibold uppercase">Stock Global</span>
                             <p className="text-lg font-bold">{selectedProduct.stockActual}</p>
                         </div>
                         {selectedProduct.tipo === 'Reventa' && (
                             <>
                                <div>
                                    <span className="text-xs text-gray-500 font-semibold uppercase">Costo Compra</span>
                                    <p>${selectedProduct.costoCompra}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-semibold uppercase">Proveedor</span>
                                    <p>{selectedProduct.proveedor?.nombre || '-'}</p>
                                </div>
                             </>
                         )}
                     </div>
                 </div>
             )}
        </DialogContent>
      </Dialog>

      {/* --- TABLA PRINCIPAL --- */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-400"/></div> : 
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Variantes / Desglose</TableHead>
                  <TableHead>Stock Total</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {productos.map((prod) => (
                  <TableRow key={prod.id}>
                  <TableCell>{prod.id}</TableCell>
                  <TableCell className="font-medium">{prod.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={prod.tipo === 'Fabricación' ? 'default' : 'secondary'}>
                        {prod.tipo === 'Fabricación' ? <Factory className="mr-1 h-3 w-3 inline"/> : <Store className="mr-1 h-3 w-3 inline"/>}
                        {prod.tipo}
                    </Badge>
                  </TableCell>
                  
                  {/* --- COLUMNA VARIANTES (NUEVO) --- */}
                  <TableCell>
                    {prod.tipo === 'Fabricación' && prod.variantes ? (
                        <div className="flex flex-wrap gap-1">
                            {prod.variantes.map(v => (
                                <Badge key={v.id} variant="outline" className="text-xs bg-gray-50">
                                    {v.talla} {v.color}: <span className="font-bold ml-1">{v.stockActual}</span>
                                </Badge>
                            ))}
                            {prod.variantes.length === 0 && <span className="text-xs text-gray-400 italic">Sin variantes registradas</span>}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell className={prod.stockActual === 0 ? "text-red-500 font-bold" : "font-bold"}>{prod.stockActual}</TableCell>
                  <TableCell>${prod.precioVenta.toFixed(2)}</TableCell>
                  
                  {/* Acciones CRUD */}
                  <TableCell className="text-right flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {setSelectedProduct(prod); setDetailsDialogOpen(true);}}>
                          <Eye className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(prod)}>
                          <Pencil className="w-4 h-4 text-orange-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(prod.id, prod.tipo)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                  </TableCell>
                  </TableRow>
              ))}
              {productos.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-6">No hay inventario registrado.</TableCell></TableRow>}
              </TableBody>
          </Table>
          }
        </CardContent>
      </Card>
    </section>
  );
}