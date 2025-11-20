"use client";
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ShoppingCart, Loader2, Trash2, Eye, Search, Store, Factory } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- Interfaces ---
interface Canal { id: number; nombre: string; }
interface ItemVenta {
    tempId: number;
    tipo: "variante" | "reventa";
    idReferencia: number; // ID de la variante o del producto reventa
    nombre: string;
    detalle: string; // Talla/Color o Descripción
    cantidad: number;
    precio: number;
    maxStock: number;
}
interface Venta {
    id: number;
    fecha: string;
    estado: string;
    canal: Canal;
    detalles: any[];
}

export default function VentasPage() {
  // Datos
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [inventario, setInventario] = useState<any[]>([]); // Mezcla de Variantes y Prod Reventa
  
  // UI
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Formulario Venta
  const [selectedCanal, setSelectedCanal] = useState("");
  const [cart, setCart] = useState<ItemVenta[]>([]);
  
  // Formulario Item
  const [selectedItemJson, setSelectedItemJson] = useState(""); // Guardamos el objeto entero como string para facilitar
  const [qty, setQty] = useState("1");

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem("inventia_token");
        const headers = { 'Authorization': `Bearer ${token}` };

        const [resVentas, resCanales, resVar, resRev, resFab] = await Promise.all([
            fetch("http://127.0.0.1:8000/ventas/", { headers }),
            fetch("http://127.0.0.1:8000/ventas/canales", { headers }),
            fetch("http://127.0.0.1:8000/produccion/variantes", { headers }),
            fetch("http://127.0.0.1:8000/productos/reventa", { headers }),
            fetch("http://127.0.0.1:8000/productos/fabricados", { headers })
        ]);

        setVentas(await resVentas.json());
        setCanales(await resCanales.json());
        
        // Construir inventario unificado para el selector
        const variantes = await resVar.json();
        const reventa = await resRev.json();
        const fabricados = await resFab.json(); // Para obtener nombres de variantes

        const itemsVariantes = variantes.map((v: any) => {
            const padre = fabricados.find((f: any) => f.id === v.producto_fabricado_id);
            return {
                uniqueId: `var-${v.id}`,
                type: "variante",
                id: v.id,
                nombre: padre ? padre.nombre : "Producto",
                detalle: `${v.talla} / ${v.color}`,
                precio: padre ? padre.precioVenta : 0,
                stock: v.stockActual
            };
        });

        const itemsReventa = reventa.map((p: any) => ({
            uniqueId: `rev-${p.id}`,
            type: "reventa",
            id: p.id,
            nombre: p.nombre,
            detalle: "Reventa",
            precio: p.precioVenta,
            stock: p.stockActual
        }));

        setInventario([...itemsVariantes, ...itemsReventa]);

    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Carrito ---
  const addToCart = () => {
      if (!selectedItemJson || !qty) return;
      const itemData = JSON.parse(selectedItemJson);
      const cantidad = parseInt(qty);

      if (cantidad > itemData.stock) {
          alert(`Solo hay ${itemData.stock} unidades disponibles.`);
          return;
      }

      const newItem: ItemVenta = {
          tempId: Date.now(),
          tipo: itemData.type,
          idReferencia: itemData.id,
          nombre: itemData.nombre,
          detalle: itemData.detalle,
          precio: itemData.precio,
          cantidad: cantidad,
          maxStock: itemData.stock
      };

      setCart([...cart, newItem]);
      setSelectedItemJson("");
      setQty("1");
  };

  const removeFromCart = (id: number) => setCart(cart.filter(i => i.tempId !== id));

  // --- Guardar Venta ---
  const handleSave = async () => {
      if (!selectedCanal || cart.length === 0) return;
      setIsSaving(true);
      setError("");
      
      const token = localStorage.getItem("inventia_token");
      const body = {
          canal_venta_id: parseInt(selectedCanal),
          estado: "Pagada", // Asumimos pagada para venta manual directa
          detalles: cart.map(i => ({
              cantidad: i.cantidad,
              precioUnitario: i.precio,
              variante_producto_id: i.tipo === "variante" ? i.idReferencia : null,
              producto_reventa_id: i.tipo === "reventa" ? i.idReferencia : null
          }))
      };

      try {
          const res = await fetch("http://127.0.0.1:8000/ventas/", {
              method: "POST",
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(body)
          });

          if (!res.ok) {
              const err = await res.json();
              throw new Error(err.detail || "Error al registrar venta");
          }

          setCreateDialogOpen(false);
          setCart([]);
          setSelectedCanal("");
          fetchData();
      } catch (err: any) { setError(err.message); } finally { setIsSaving(false); }
  };

  // --- Eliminar (Cancelar) Venta ---
  const handleCancel = async (id: number) => {
      if (!confirm("¿Cancelar venta? El stock será devuelto al inventario.")) return;
      const token = localStorage.getItem("inventia_token");
      try {
          await fetch(`http://127.0.0.1:8000/ventas/${id}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` } });
          fetchData();
      } catch (e) { console.error(e); }
  };

  // --- Ver Detalles ---
  const handleDetails = (venta: Venta) => {
      setSelectedVenta(venta);
      setDetailsDialogOpen(true);
  };

  const totalCart = cart.reduce((acc, i) => acc + (i.cantidad * i.precio), 0);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛒 Ventas</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Nueva Venta Manual</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader><DialogTitle>Registrar Venta</DialogTitle></DialogHeader>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                
                <div className="grid gap-4 py-2">
                    <div className="flex items-center gap-2">
                        <Label>Canal:</Label>
                        <Select value={selectedCanal} onValueChange={setSelectedCanal}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                            <SelectContent>
                                {canales.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border grid gap-3">
                        <span className="font-bold text-sm">Agregar Producto:</span>
                        <div className="flex gap-2">
                            <Select value={selectedItemJson} onValueChange={setSelectedItemJson}>
                                <SelectTrigger className="flex-1"><SelectValue placeholder="Buscar producto..." /></SelectTrigger>
                                <SelectContent>
                                    {inventario.map(item => (
                                        <SelectItem key={item.uniqueId} value={JSON.stringify(item)} disabled={item.stock <= 0}>
                                            {item.nombre} ({item.detalle}) - Stock: {item.stock} - ${item.precio}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input type="number" className="w-20" value={qty} onChange={e => setQty(e.target.value)} min={1} />
                            <Button variant="secondary" onClick={addToCart} disabled={!selectedItemJson}>Agregar</Button>
                        </div>
                    </div>

                    <div className="border rounded max-h-[200px] overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Detalle</TableHead><TableHead>Cant.</TableHead><TableHead>Subtotal</TableHead><TableHead></TableHead></TableRow></TableHeader>
                            <TableBody>
                                {cart.map(i => (
                                    <TableRow key={i.tempId}>
                                        <TableCell className="font-medium">{i.nombre}</TableCell>
                                        <TableCell>{i.detalle}</TableCell>
                                        <TableCell>{i.cantidad}</TableCell>
                                        <TableCell>${(i.cantidad * i.precio).toFixed(2)}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeFromCart(i.tempId)}><Trash2 className="h-4 w-4 text-red-500"/></Button></TableCell>
                                    </TableRow>
                                ))}
                                {cart.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground">Carrito vacío</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>
                    
                    <div className="flex justify-end items-center gap-2 text-lg">
                        <span>Total Venta:</span>
                        <span className="font-bold text-green-700">${totalCart.toFixed(2)}</span>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving || cart.length === 0 || !selectedCanal}>
                        {isSaving ? <Loader2 className="animate-spin mr-2"/> : <ShoppingCart className="mr-2 h-4 w-4"/>} Confirmar Venta
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      {/* MODAL DETALLES */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
              <DialogHeader><DialogTitle>Detalle de Venta #{selectedVenta?.id}</DialogTitle></DialogHeader>
              {selectedVenta && (
                  <div className="grid gap-4">
                      <div className="flex justify-between">
                          <span><strong>Canal:</strong> {selectedVenta.canal?.nombre}</span>
                          <span><strong>Fecha:</strong> {new Date(selectedVenta.fecha).toLocaleString()}</span>
                      </div>
                      <div className="border rounded">
                          <Table>
                              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Cant.</TableHead><TableHead className="text-right">Precio Unit.</TableHead></TableRow></TableHeader>
                              <TableBody>
                                  {selectedVenta.detalles.map((d: any) => (
                                      <TableRow key={d.id}>
                                          <TableCell>
                                              {d.variante ? 
                                                <span><Factory className="inline w-3 h-3 mr-1 text-blue-500"/> {d.variante.talla} {d.variante.color}</span> : 
                                                <span><Store className="inline w-3 h-3 mr-1 text-green-500"/> {d.producto_reventa?.nombre}</span>
                                              }
                                          </TableCell>
                                          <TableCell>{d.cantidad}</TableCell>
                                          <TableCell className="text-right">${d.precioUnitario.toFixed(2)}</TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </div>
                  </div>
              )}
          </DialogContent>
      </Dialog>

      {/* TABLA HISTORIAL */}
      <Card>
        <CardHeader><CardTitle>Historial de Ventas</CardTitle></CardHeader>
        <CardContent>
            {isLoading ? <div className="text-center py-4"><Loader2 className="animate-spin h-8 w-8 mx-auto"/></div> : 
            <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Fecha</TableHead><TableHead>Canal</TableHead><TableHead>Total Items</TableHead><TableHead>Total $</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                    {ventas.map(v => {
                        const total = v.detalles.reduce((acc, d: any) => acc + (d.cantidad * d.precioUnitario), 0);
                        return (
                            <TableRow key={v.id}>
                                <TableCell>#{v.id}</TableCell>
                                <TableCell>{new Date(v.fecha).toLocaleDateString()}</TableCell>
                                <TableCell>{v.canal?.nombre}</TableCell>
                                <TableCell>{v.detalles.length}</TableCell>
                                <TableCell className="font-bold">${total.toFixed(2)}</TableCell>
                                <TableCell><Badge variant="outline">{v.estado}</Badge></TableCell>
                                <TableCell className="text-right flex justify-end gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleDetails(v)}><Eye className="h-4 w-4 text-blue-500"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleCancel(v.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            }
        </CardContent>
      </Card>
    </section>
  );
}