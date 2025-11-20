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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CheckCircle, Loader2, Trash2, ShoppingCart, Box, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- Interfaces ---
interface ItemCompra {
    tempId: number; // ID temporal para la UI
    tipo: "materia" | "producto";
    idReferencia: string; // ID real en BD
    nombre: string;
    cantidad: number;
    costo: number;
}

interface OrdenCompra {
    id: number;
    fecha: string;
    estado: string;
    proveedor: { nombre: string };
    detalles: any[];
}

export default function ComprasPage() {
  // Datos Maestros
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [productosRev, setProductosRev] = useState<any[]>([]);

  // Estado UI
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado Formulario Nueva Orden
  const [selectedProv, setSelectedProv] = useState("");
  const [cart, setCart] = useState<ItemCompra[]>([]);
  
  // Estado Formulario Agregar Item al Carrito
  const [itemType, setItemType] = useState<"materia" | "producto">("materia");
  const [itemId, setItemId] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemCost, setItemCost] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem("inventia_token");
        const headers = { 'Authorization': `Bearer ${token}` };

        // Cargar Ordenes
        const resOrd = await fetch("http://127.0.0.1:8000/compras/", { headers });
        const dataOrd = await resOrd.json();
        setOrdenes(dataOrd);

        // Cargar Maestros para el formulario
        const resProv = await fetch("http://127.0.0.1:8000/productos/proveedores", { headers });
        const resMat = await fetch("http://127.0.0.1:8000/materia-prima", { headers });
        const resProd = await fetch("http://127.0.0.1:8000/productos/reventa", { headers });

        setProveedores(await resProv.json());
        setMaterias(await resMat.json());
        setProductosRev(await resProd.json());

    } catch (err) {
        console.error("Error cargando datos", err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Lógica del Carrito ---
  const addItemToCart = () => {
    if (!itemId || !itemQty || !itemCost) return;

    let nombreItem = "";
    if (itemType === "materia") {
        const m = materias.find(x => x.id.toString() === itemId);
        nombreItem = m ? m.nombre : "Desconocido";
    } else {
        const p = productosRev.find(x => x.id.toString() === itemId);
        nombreItem = p ? p.nombre : "Desconocido";
    }

    const newItem: ItemCompra = {
        tempId: Date.now(),
        tipo: itemType,
        idReferencia: itemId,
        nombre: nombreItem,
        cantidad: parseInt(itemQty),
        costo: parseFloat(itemCost)
    };

    setCart([...cart, newItem]);
    // Limpiar inputs de item
    setItemId("");
    setItemQty("");
    setItemCost("");
  };

  const removeItemFromCart = (id: number) => {
    setCart(cart.filter(i => i.tempId !== id));
  };

  // --- Guardar Orden ---
  const handleSaveOrder = async () => {
    if (!selectedProv || cart.length === 0) return;
    setIsSaving(true);
    
    const token = localStorage.getItem("inventia_token");
    const body = {
        proveedor_id: parseInt(selectedProv),
        detalles: cart.map(item => ({
            cantidad: item.cantidad,
            costoUnitario: item.costo,
            materia_prima_id: item.tipo === "materia" ? parseInt(item.idReferencia) : null,
            producto_reventa_id: item.tipo === "producto" ? parseInt(item.idReferencia) : null
        }))
    };

    try {
        const res = await fetch("http://127.0.0.1:8000/compras/", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            setCreateDialogOpen(false);
            setCart([]);
            setSelectedProv("");
            fetchData();
        } else {
            alert("Error al guardar la orden");
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  // --- Recibir Orden (Registrar Entrada) ---
  const handleReceiveOrder = async (id: number) => {
    const confirm = window.confirm("¿Confirmar recepción? Esto aumentará el stock de los productos.");
    if (!confirm) return;

    const token = localStorage.getItem("inventia_token");
    try {
        const res = await fetch(`http://127.0.0.1:8000/compras/${id}/recibir`, {
            method: "PUT",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            fetchData();
        } else {
            const err = await res.json();
            alert(err.detail);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const totalOrden = cart.reduce((acc, item) => acc + (item.cantidad * item.costo), 0);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚚 Gestión de Compras</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Orden de Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Crear Orden de Compra</DialogTitle>
              <DialogDescription>Agrega los items que solicitarás al proveedor.</DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-4 py-2">
                {/* Selección de Proveedor */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Proveedor:</Label>
                    <Select onValueChange={setSelectedProv} value={selectedProv}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                            {proveedores.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="border-t my-2"></div>
                
                {/* Agregar Items */}
                <div className="bg-gray-50 p-4 rounded-lg border grid gap-3">
                    <span className="text-sm font-bold text-gray-700">Agregar Item a la Orden:</span>
                    <div className="flex gap-2">
                        <Select value={itemType} onValueChange={(v: any) => {setItemType(v); setItemId("");}}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="materia">Materia Prima</SelectItem>
                                <SelectItem value="producto">Producto Reventa</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={itemId} onValueChange={setItemId}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Seleccionar Item..." />
                            </SelectTrigger>
                            <SelectContent>
                                {itemType === "materia" ? 
                                    materias.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>) :
                                    productosRev.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Input type="number" placeholder="Cant." className="w-24" value={itemQty} onChange={e => setItemQty(e.target.value)} />
                        <Input type="number" placeholder="Costo Unit." className="w-28" value={itemCost} onChange={e => setItemCost(e.target.value)} />
                        <Button variant="secondary" onClick={addItemToCart} disabled={!itemId || !itemQty || !itemCost}>Agregar</Button>
                    </div>
                </div>

                {/* Lista del Carrito */}
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Tipo</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Cant.</TableHead>
                                <TableHead>Costo</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.map(item => (
                                <TableRow key={item.tempId}>
                                    <TableCell>
                                        {item.tipo === "materia" ? <Layers size={16} className="text-purple-500"/> : <Box size={16} className="text-blue-500"/>}
                                    </TableCell>
                                    <TableCell>{item.nombre}</TableCell>
                                    <TableCell>{item.cantidad}</TableCell>
                                    <TableCell>${item.costo}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeItemFromCart(item.tempId)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                             {cart.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground">Sin items agregados</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="flex justify-end items-center gap-2">
                    <span className="text-sm text-muted-foreground">Total Estimado:</span>
                    <span className="text-lg font-bold">${totalOrden.toFixed(2)}</span>
                </div>

                <Button className="mt-2 w-full" onClick={handleSaveOrder} disabled={isSaving || cart.length === 0}>
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                    Generar Orden de Compra
                </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="historial" className="w-full">
        <TabsList>
          <TabsTrigger value="historial">Historial de Órdenes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="text-center py-4">Cargando...</div> : 
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID OC</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenes.map((oc) => (
                    <TableRow key={oc.id}>
                      <TableCell className="font-medium">#{oc.id}</TableCell>
                      <TableCell>{oc.proveedor ? oc.proveedor.nombre : "Sin nombre"}</TableCell>
                      <TableCell>{new Date(oc.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>{oc.detalles.length} items</TableCell>
                      <TableCell>
                        <Badge variant={oc.estado === 'Recibida' ? 'default' : 'outline'} className={oc.estado === 'Solicitada' ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100" : ""}>
                            {oc.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {oc.estado === 'Solicitada' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleReceiveOrder(oc.id)}
                          >
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Registrar Entrada
                          </Button>
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
      </Tabs>
    </section>
  );
}