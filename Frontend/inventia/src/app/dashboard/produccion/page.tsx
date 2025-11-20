"use client";
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, AlertTriangle, CheckCircle, Loader2, Factory, RefreshCw, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- Interfaces ---
interface Variante {
  id: number;
  color: string;
  talla: string;
  stockActual: number;
  producto_fabricado: { id: number; nombre: string; };
}

interface OrdenProduccion {
  id: number;
  cantidadProducida: number;
  fechaCreacion: string;
  estado: string;
  variante: Variante;
}

interface ProductoFabricado {
    id: number;
    nombre: string;
}

export default function ProduccionPage() {
  // Datos
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [productosFab, setProductosFab] = useState<ProductoFabricado[]>([]); // Para crear nuevas variantes
  
  // UI
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Formularios
  const [newOrder, setNewOrder] = useState({ variante_id: "", cantidad: "" });
  const [newVariant, setNewVariant] = useState({ producto_id: "", color: "", talla: "" });

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem("inventia_token");
        const headers = { 'Authorization': `Bearer ${token}` };

        const resOrd = await fetch("http://127.0.0.1:8000/produccion/ordenes", { headers });
        const resVar = await fetch("http://127.0.0.1:8000/produccion/variantes", { headers });
        const resProd = await fetch("http://127.0.0.1:8000/productos/fabricados", { headers });

        setOrdenes(await resOrd.json());
        setVariantes(await resVar.json());
        setProductosFab(await resProd.json());
    } catch (err) {
        console.error(err);
        setError("Error de conexión con el servidor");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Crear Orden ---
  const handleCreateOrder = async () => {
    setIsSaving(true);
    setError("");
    try {
        const token = localStorage.getItem("inventia_token");
        const res = await fetch("http://127.0.0.1:8000/produccion/ordenes", {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                variante_producto_id: parseInt(newOrder.variante_id),
                cantidadProducida: parseInt(newOrder.cantidad),
                estado: "En Proceso"
            })
        });
        if (!res.ok) throw new Error("Error al crear orden");
        
        setCreateDialogOpen(false);
        setNewOrder({ variante_id: "", cantidad: "" });
        fetchData();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  // --- Terminar Orden ---
  const handleFinishOrder = async (id: number) => {
    if (!confirm("¿Confirmar finalización? Se descontará el material del inventario.")) return;
    
    try {
        const token = localStorage.getItem("inventia_token");
        const res = await fetch(`http://127.0.0.1:8000/produccion/ordenes/${id}/terminar`, {
            method: "PUT",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const errData = await res.json();
            alert("Error: " + errData.detail); // Mostrar error de stock insuficiente
        } else {
            fetchData();
        }
    } catch (err) {
        console.error(err);
    }
  };

  // --- Crear Variante ---
  const handleCreateVariant = async () => {
    setIsSaving(true);
    try {
        const token = localStorage.getItem("inventia_token");
        const res = await fetch("http://127.0.0.1:8000/produccion/variantes", {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                producto_fabricado_id: parseInt(newVariant.producto_id),
                color: newVariant.color,
                talla: newVariant.talla,
                stockActual: 0
            })
        });
        if (res.ok) {
            setVariantDialogOpen(false);
            setNewVariant({ producto_id: "", color: "", talla: "" });
            fetchData();
        }
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🧵 Producción</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Modal Crear Variante (Configuración) */}
            <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="secondary">
                        <Settings2 className="mr-2 h-4 w-4" />
                        Crear Variante
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Variante de Producto</DialogTitle>
                        <DialogDescription>Registra una combinación de Talla/Color para un producto base.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Producto Base</Label>
                            <Select onValueChange={(v) => setNewVariant({...newVariant, producto_id: v})}>
                                <SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                <SelectContent>
                                    {productosFab.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Talla</Label>
                            <Input className="col-span-3" placeholder="Ej. CH, M, G, 32, 34" value={newVariant.talla} onChange={e => setNewVariant({...newVariant, talla: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Color</Label>
                            <Input className="col-span-3" placeholder="Ej. Azul, Rojo" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} />
                        </div>
                        <Button onClick={handleCreateVariant} disabled={isSaving}>Guardar Variante</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal Crear Orden */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Lote
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Lanzar Orden de Producción</DialogTitle>
                <DialogDescription>
                    Selecciona qué variante vas a fabricar.
                </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Producto</Label>
                    <Select onValueChange={(v) => setNewOrder({...newOrder, variante_id: v})}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar variante..." />
                    </SelectTrigger>
                    <SelectContent>
                        {variantes.map(v => (
                            <SelectItem key={v.id} value={v.id.toString()}>
                                {v.producto_fabricado.nombre} - {v.talla} / {v.color}
                            </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Cantidad</Label>
                    <Input type="number" className="col-span-3" value={newOrder.cantidad} onChange={e => setNewOrder({...newOrder, cantidad: e.target.value})} />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-xs text-blue-800">
                        Al terminar la orden, se descontará automáticamente la materia prima configurada en el BOM.
                    </AlertDescription>
                </Alert>

                <Button onClick={handleCreateOrder} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                    Confirmar Lote
                </Button>
                </div>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <Tabs defaultValue="historial_lotes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="historial_lotes">Historial de Lotes</TabsTrigger>
          <TabsTrigger value="cola_produccion" disabled>
            <AlertTriangle className="mr-2 h-4 w-4 text-gray-400"/>
            Cola de Pedidos (Próximamente)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="historial_lotes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lotes de Producción Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="text-center py-4">Cargando...</div> :
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Lote</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenes.map((lote) => (
                    <TableRow key={lote.id}>
                      <TableCell>#{lote.id}</TableCell>
                      <TableCell className="font-medium">{lote.variante.producto_fabricado.nombre}</TableCell>
                      <TableCell><Badge variant="outline">{lote.variante.talla} - {lote.variante.color}</Badge></TableCell>
                      <TableCell>{lote.cantidadProducida}</TableCell>
                      <TableCell>{new Date(lote.fechaCreacion).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={lote.estado === 'Terminado' ? 'default' : 'secondary'} className={lote.estado === 'En Proceso' ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}>
                            {lote.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lote.estado === 'En Proceso' && (
                            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleFinishOrder(lote.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Terminar
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