"use client";
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2, RefreshCw, Eye, Pencil, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Proveedor { id: number; nombre: string; }
interface MateriaPrima {
  id: number; nombre: string; descripcion?: string; costo: number; unidadMedida: string; stockActual: number; proveedor?: Proveedor; proveedor_id?: number;
}

export default function InventarioMateriaPage() {
  const [materiales, setMateriales] = useState<MateriaPrima[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "", descripcion: "", costo: "", unidadMedida: "unidades", stockActual: "", proveedor_id: ""
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("inventia_token");
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resMat, resProv] = await Promise.all([
          fetch("http://127.0.0.1:8000/materia-prima", { headers }),
          fetch("http://127.0.0.1:8000/productos/proveedores", { headers })
      ]);
      setMateriales(await resMat.json());
      setProveedores(await resProv.json());
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => {
      setIsEditing(false);
      setFormData({ nombre: "", descripcion: "", costo: "", unidadMedida: "unidades", stockActual: "", proveedor_id: "" });
      setDialogOpen(true);
  };

  const handleEdit = (mat: MateriaPrima) => {
      setIsEditing(true);
      setCurrentId(mat.id);
      setFormData({
          nombre: mat.nombre,
          descripcion: mat.descripcion || "",
          costo: mat.costo.toString(),
          unidadMedida: mat.unidadMedida,
          stockActual: mat.stockActual.toString(),
          proveedor_id: mat.proveedor_id?.toString() || (mat.proveedor?.id.toString() || "")
      });
      setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
      if (!confirm("¿Eliminar material?")) return;
      const token = localStorage.getItem("inventia_token");
      await fetch(`http://127.0.0.1:8000/materia-prima/${id}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` }});
      fetchData();
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    const token = localStorage.getItem("inventia_token");
    try {
        let url = "http://127.0.0.1:8000/materia-prima";
        if (isEditing) url += `/${currentId}`;

        const body = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            costo: parseFloat(formData.costo),
            unidadMedida: formData.unidadMedida,
            stockActual: parseInt(formData.stockActual),
            proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null
        };

        const res = await fetch(url, { method: isEditing ? "PUT" : "POST", headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error("Error al guardar");

        setDialogOpen(false);
        fetchData();
    } catch (err: any) { setError(err.message); } finally { setIsSaving(false); }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🗳️ Inventario de Materia Prima</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}><RefreshCw className="mr-2 h-4 w-4"/> Actualizar</Button>
            <Button onClick={handleOpenCreate}><PlusCircle className="mr-2 h-4 w-4"/> Agregar Material</Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{isEditing ? "Editar Material" : "Agregar Material"}</DialogTitle></DialogHeader>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Nombre</Label>
                    <Input className="col-span-3" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Descripción</Label>
                    <Input className="col-span-3" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Proveedor</Label>
                    <Select value={formData.proveedor_id} onValueChange={v => setFormData({...formData, proveedor_id: v})}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>{proveedores.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Costo</Label>
                    <Input type="number" className="col-span-3" value={formData.costo} onChange={e => setFormData({...formData, costo: e.target.value})} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Stock</Label>
                    <Input type="number" className="col-span-3" value={formData.stockActual} onChange={e => setFormData({...formData, stockActual: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin"/> : "Guardar"}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Proveedor</TableHead><TableHead>Costo</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                  {materiales.map(m => (
                      <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.nombre}</TableCell>
                          <TableCell>{m.proveedor ? m.proveedor.nombre : '-'}</TableCell>
                          <TableCell>${m.costo}</TableCell>
                          <TableCell>{m.stockActual} {m.unidadMedida}</TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}><Pencil className="w-4 h-4 text-orange-500"/></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}