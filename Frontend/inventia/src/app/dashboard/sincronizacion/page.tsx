"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Globe, UploadCloud, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Datos ficticios para estado de canales (RF-11)
const mockCanales = [
  { nombre: "Mercado Libre", estado: "Conectado", ultimaSinc: "Hace 1 min" },
  { nombre: "Shein", estado: "Conectado", ultimaSinc: "Hace 2 min" },
  { nombre: "Amazon", estado: "Conectado", ultimaSinc: "Hace 5 min" },
];

interface ProductoSincro {
    unique_id: string;
    tipo: "Variante" | "Reventa";
    id_db: number;
    nombre: string;
    precio: number;
    stock: number;
    meli_id?: string; // Si existe, está publicado
}

export default function SincronizacionPage() {
  const [productos, setProductos] = useState<ProductoSincro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modales
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState<ProductoSincro | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario Publicación/Edición
  const [formData, setFormData] = useState({
      title: "",
      price: "",
      quantity: "",
      category_id: "MLM1055", // Default Celulares, cambiar según negocio
      listing_type: "gold_special",
      condition: "new",
      description: "",
      picture_url: "https://http2.mlstatic.com/D_NQ_NP_963337-MLM43963226042_102020-O.webp"
  });

  const fetchData = async () => {
      setIsLoading(true);
      try {
          const token = localStorage.getItem("inventia_token");
          const res = await fetch("http://127.0.0.1:8000/sincronizacion/productos", {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          setProductos(await res.json());
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Abrir Modal Publicar ---
  const handleOpenPublish = (prod: ProductoSincro) => {
      setSelectedProd(prod);
      setFormData({
          title: prod.nombre,
          price: prod.precio.toString(),
          quantity: prod.stock.toString(),
          category_id: "MLM1055",
          listing_type: "gold_special",
          condition: "new",
          description: `Producto increíble: ${prod.nombre}`,
          picture_url: "https://http2.mlstatic.com/D_NQ_NP_963337-MLM43963226042_102020-O.webp"
      });
      setPublishDialogOpen(true);
  };

  // --- Abrir Modal Editar ---
  const handleOpenEdit = (prod: ProductoSincro) => {
      setSelectedProd(prod);
      setFormData({
          title: prod.nombre, // Simulamos traer datos actuales
          price: prod.precio.toString(),
          quantity: prod.stock.toString(),
          category_id: "MLM1055",
          listing_type: "gold_special",
          condition: "new",
          description: "Descripción actual en MeLi...",
          picture_url: "https://http2.mlstatic.com/D_NQ_NP_963337-MLM43963226042_102020-O.webp"
      });
      setEditDialogOpen(true);
  };

  // --- Acción Publicar ---
  const submitPublish = async () => {
      if (!selectedProd) return;
      setIsSaving(true);
      const token = localStorage.getItem("inventia_token");
      
      const body: any = {
          ...formData,
          price: parseFloat(formData.price),
          available_quantity: parseInt(formData.quantity),
      };
      
      // Identificar qué ID enviar
      if (selectedProd.tipo === "Variante") body.variante_id = selectedProd.id_db;
      else body.reventa_id = selectedProd.id_db;

      try {
          const res = await fetch("http://127.0.0.1:8000/sincronizacion/mercadolibre/publicar", {
              method: "POST",
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(body)
          });
          
          if (res.ok) {
              setPublishDialogOpen(false);
              fetchData();
              alert("¡Producto publicado exitosamente en Mercado Libre!");
          } else {
              alert("Error al publicar");
          }
      } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  // --- Acción Editar ---
  const submitEdit = async () => {
      if (!selectedProd?.meli_id) return;
      setIsSaving(true);
      const token = localStorage.getItem("inventia_token");
      
      // Solo enviamos lo que la API de editar soporte (ej. precio, stock)
      const body = {
          title: formData.title,
          price: parseFloat(formData.price),
          available_quantity: parseInt(formData.quantity)
      };

      try {
          await fetch(`http://127.0.0.1:8000/sincronizacion/mercadolibre/${selectedProd.meli_id}`, {
              method: "PUT",
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(body)
          });
          setEditDialogOpen(false);
          fetchData();
          alert("Publicación actualizada.");
      } catch(e) { console.error(e); } finally { setIsSaving(false); }
  };

  // --- Acción Eliminar ---
  const handleDelete = async (unique_id: string) => {
      if (!confirm("¿Estás seguro? Esto eliminará la publicación de Mercado Libre y desvinculará el producto.")) return;
      const token = localStorage.getItem("inventia_token");
      try {
          await fetch(`http://127.0.0.1:8000/sincronizacion/mercadolibre/${unique_id}`, {
              method: "DELETE",
              headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchData();
      } catch(e) { console.error(e); }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">⚡ Sincronización Multicanal</h1>
      </div>

      <Tabs defaultValue="gestion_meli" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gestion_meli">Gestión Productos MeLi</TabsTrigger>
          <TabsTrigger value="estado_canales">Estado de Canales</TabsTrigger>
        </TabsList>
        
        {/* PESTAÑA GESTIÓN PRODUCTOS MELI */}
        <TabsContent value="gestion_meli" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Catálogo para Mercado Libre</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="text-center py-8"><Loader2 className="animate-spin mx-auto"/></div> : 
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Estado MeLi</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {productos.map(p => (
                                <TableRow key={p.unique_id}>
                                    <TableCell className="font-medium">{p.nombre}</TableCell>
                                    <TableCell><Badge variant="outline">{p.tipo}</Badge></TableCell>
                                    <TableCell>${p.precio}</TableCell>
                                    <TableCell>{p.stock}</TableCell>
                                    <TableCell>
                                        {p.meli_id ? 
                                            <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-0">Publicado ({p.meli_id})</Badge> : 
                                            <Badge variant="secondary" className="text-gray-400">No Publicado</Badge>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Button 
                                            size="sm" 
                                            className="bg-blue-600 hover:bg-blue-700 text-white" 
                                            disabled={!!p.meli_id} // Deshabilitar si ya tiene ID
                                            onClick={() => handleOpenPublish(p)}
                                        >
                                            <UploadCloud className="w-4 h-4 mr-1"/> Publicar
                                        </Button>
                                        
                                        {p.meli_id && (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(p)}>
                                                    <Pencil className="w-4 h-4 text-orange-500"/>
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDelete(p.unique_id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    }
                </CardContent>
            </Card>
        </TabsContent>

        {/* PESTAÑA ESTADO (Visual) */}
        <TabsContent value="estado_canales" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCanales.map((canal) => (
              <Card key={canal.nombre}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-base">
                    {canal.nombre}
                    <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3"/> {canal.estado}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex items-center text-sm text-gray-500"><Clock className="mr-2 h-4 w-4"/> Sinc: {canal.ultimaSinc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL PUBLICAR */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><Globe className="text-blue-500"/> Publicar en Mercado Libre</DialogTitle>
                  <DialogDescription>Ingresa los detalles requeridos por el Marketplace.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                  {/* Campos MeLi */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><Label>Título</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                      <div className="space-y-1"><Label>Categoría ID</Label><Input value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><Label>Precio (MXN)</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                      <div className="space-y-1"><Label>Stock Disponible</Label><Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label>Tipo Publicación</Label>
                          <Select value={formData.listing_type} onValueChange={v => setFormData({...formData, listing_type: v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="gold_special">Clásica</SelectItem>
                                  <SelectItem value="gold_pro">Premium</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-1">
                          <Label>Condición</Label>
                          <Select value={formData.condition} onValueChange={v => setFormData({...formData, condition: v})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="new">Nuevo</SelectItem>
                                  <SelectItem value="used">Usado</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <div className="space-y-1"><Label>URL Imagen Principal</Label><Input value={formData.picture_url} onChange={e => setFormData({...formData, picture_url: e.target.value})} /></div>
                  <div className="space-y-1"><Label>Descripción (Texto Plano)</Label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                  
                  <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                      <AlertDescription className="text-xs">
                          Se creará una publicación real en MeLi. Asegúrate de que el stock coincida con tu inventario físico.
                      </AlertDescription>
                  </Alert>
              </div>
              <DialogFooter>
                  <Button onClick={submitPublish} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                      {isSaving ? <Loader2 className="animate-spin mr-2"/> : "Confirmar Publicación"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                  <DialogTitle>Editar Publicación MeLi</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                  <div className="space-y-1"><Label>Título</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><Label>Precio</Label><Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                      <div className="space-y-1"><Label>Stock</Label><Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></div>
                  </div>
                  <p className="text-xs text-gray-500">Para cambios avanzados (categoría, tipo), hazlo directo en Mercado Libre.</p>
              </div>
              <DialogFooter>
                  <Button onClick={submitEdit} disabled={isSaving}>Guardar Cambios</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </section>
  );
}