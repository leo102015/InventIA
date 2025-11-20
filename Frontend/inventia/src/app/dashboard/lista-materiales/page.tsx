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
import { PlusCircle, Trash2, Loader2, RefreshCw, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BOMItem {
    id: number;
    cantidadRequerida: number;
    materia_prima: {
        id: number;
        nombre: string;
        unidadMedida: string;
    };
    producto_fabricado_id: number;
}

interface Producto {
    id: number;
    nombre: string;
}

interface Material {
    id: number;
    nombre: string;
    unidadMedida: string;
}

export default function ListaMaterialesPage() {
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
      producto_id: "",
      materia_id: "",
      cantidad: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem("inventia_token");
        const headers = { 'Authorization': `Bearer ${token}` };

        const [resBOM, resProd, resMat] = await Promise.all([
            fetch("http://127.0.0.1:8000/produccion/bom", { headers }),
            fetch("http://127.0.0.1:8000/productos/fabricados", { headers }),
            fetch("http://127.0.0.1:8000/materia-prima", { headers })
        ]);

        setBomItems(await resBOM.json());
        setProductos(await resProd.json());
        setMateriales(await resMat.json());

    } catch (err) {
        console.error(err);
        setError("Error cargando datos.");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    try {
        const token = localStorage.getItem("inventia_token");
        const res = await fetch("http://127.0.0.1:8000/produccion/bom", {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                producto_fabricado_id: parseInt(formData.producto_id),
                materia_prima_id: parseInt(formData.materia_id),
                cantidadRequerida: parseFloat(formData.cantidad)
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error al guardar");
        }

        fetchData();
        setDialogOpen(false);
        setFormData({ producto_id: "", materia_id: "", cantidad: "" });

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("¿Eliminar este material de la receta?")) return;
      const token = localStorage.getItem("inventia_token");
      await fetch(`http://127.0.0.1:8000/produccion/bom/${id}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` }});
      fetchData();
  };

  // Agrupar BOM por producto para visualizar mejor
  const groupedBOM: Record<string, BOMItem[]> = {};
  bomItems.forEach(item => {
      const prodName = productos.find(p => p.id === item.producto_fabricado_id)?.nombre || "Producto Desconocido";
      if (!groupedBOM[prodName]) groupedBOM[prodName] = [];
      groupedBOM[prodName].push(item);
  });

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛠️ Lista de Materiales (BOM)</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Asignar Material
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configurar Receta</DialogTitle>
                    <DialogDescription>Define qué material se consume para fabricar un producto.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    
                    <div className="grid gap-2">
                        <Label>Producto Fabricado</Label>
                        <Select onValueChange={v => setFormData({...formData, producto_id: v})}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                            <SelectContent>
                                {productos.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Materia Prima Requerida</Label>
                        <Select onValueChange={v => setFormData({...formData, materia_id: v})}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                            <SelectContent>
                                {materiales.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.nombre} ({m.unidadMedida})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Cantidad a consumir (por unidad de producto)</Label>
                        <Input type="number" placeholder="Ej. 1.5" value={formData.cantidad} onChange={e => setFormData({...formData, cantidad: e.target.value})} />
                    </div>

                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Relación
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
          {isLoading ? <div className="text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-400"/></div> :
            Object.entries(groupedBOM).map(([prodName, items]) => (
                <Card key={prodName}>
                    <CardHeader className="bg-gray-50 border-b py-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            {prodName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Materia Prima</TableHead>
                                    <TableHead>Consumo x Unidad</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.materia_prima.nombre}</TableCell>
                                        <TableCell className="font-medium">
                                            {item.cantidadRequerida} {item.materia_prima.unidadMedida}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))
          }
          {!isLoading && bomItems.length === 0 && (
              <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                  No hay recetas configuradas. Agrega una relación para empezar.
              </div>
          )}
      </div>
    </section>
  );
}