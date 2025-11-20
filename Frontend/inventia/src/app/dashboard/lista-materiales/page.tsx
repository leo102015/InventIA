"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2, Pencil, Save } from "lucide-react";

export default function ListaMaterialesPage() {
  const [bomItems, setBomItems] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ producto_id: "", materia_id: "", cantidad: "" });
  const [editQty, setEditQty] = useState("");

  const fetchData = async () => {
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
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem("inventia_token");
    await fetch("http://127.0.0.1:8000/produccion/bom", {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ producto_fabricado_id: parseInt(formData.producto_id), materia_prima_id: parseInt(formData.materia_id), cantidadRequerida: parseFloat(formData.cantidad) })
    });
    setDialogOpen(false); fetchData();
  };

  const handleEdit = (item: any) => {
      setCurrentEditId(item.id);
      setEditQty(item.cantidadRequerida.toString());
      setEditDialogOpen(true);
  };

  const submitEdit = async () => {
      const token = localStorage.getItem("inventia_token");
      await fetch(`http://127.0.0.1:8000/produccion/bom/${currentEditId}`, {
          method: "PUT",
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ cantidadRequerida: parseFloat(editQty), producto_fabricado_id: 0, materia_prima_id: 0 }) // IDs ignorados en update parcial
      });
      setEditDialogOpen(false); fetchData();
  };

  const handleDelete = async (id: number) => {
      if(!confirm("¿Eliminar?")) return;
      const token = localStorage.getItem("inventia_token");
      await fetch(`http://127.0.0.1:8000/produccion/bom/${id}`, { method: "DELETE", headers: { 'Authorization': `Bearer ${token}` }});
      fetchData();
  };

  const groupedBOM: Record<string, any[]> = {};
  bomItems.forEach(item => {
      const prodName = productos.find(p => p.id === item.producto_fabricado_id)?.nombre || "Desconocido";
      if (!groupedBOM[prodName]) groupedBOM[prodName] = [];
      groupedBOM[prodName].push(item);
  });

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛠️ Lista de Materiales (BOM)</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4"/> Asignar</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Asignar Material</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select onValueChange={v => setFormData({...formData, producto_id: v})}><SelectTrigger><SelectValue placeholder="Producto" /></SelectTrigger><SelectContent>{productos.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>)}</SelectContent></Select>
                    <Select onValueChange={v => setFormData({...formData, materia_id: v})}><SelectTrigger><SelectValue placeholder="Material" /></SelectTrigger><SelectContent>{materiales.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>)}</SelectContent></Select>
                    <Input type="number" placeholder="Cantidad" onChange={e => setFormData({...formData, cantidad: e.target.value})} />
                    <Button onClick={handleSubmit}>Guardar</Button>
                </div>
            </DialogContent>
        </Dialog>

        {/* Modal Edición Rápida */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[300px]">
                <DialogHeader><DialogTitle>Editar Cantidad</DialogTitle></DialogHeader>
                <Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} />
                <Button onClick={submitEdit}>Actualizar</Button>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedBOM).map(([prodName, items]) => (
            <Card key={prodName}>
                <CardHeader className="py-3 bg-gray-50"><CardTitle className="text-base">{prodName}</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Material</TableHead><TableHead>Cantidad</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>{items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.materia_prima.nombre}</TableCell>
                                <TableCell>{item.cantidadRequerida} {item.materia_prima.unidadMedida}</TableCell>
                                <TableCell className="text-right flex justify-end gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4 text-blue-500"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                </CardContent>
            </Card>
        ))}
      </div>
    </section>
  );
}