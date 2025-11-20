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
import { PlusCircle, ScanBarcode, Loader2, RefreshCw, Eye, Layers, DollarSign, Ruler } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Interfaces del Backend
interface Proveedor {
  id: number;
  nombre: string;
}

interface MateriaPrima {
  id: number;
  nombre: string;
  descripcion?: string;
  costo: number;
  unidadMedida: string;
  stockActual: number;
  proveedor?: Proveedor;
}

export default function InventarioMateriaPage() {
  // Estados de Datos
  const [materiales, setMateriales] = useState<MateriaPrima[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MateriaPrima | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    costo: "",
    unidadMedida: "unidades", // Valor por defecto
    stockActual: "",
    proveedor_id: ""
  });

  // --- Cargar Datos ---
  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("inventia_token");
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Cargar Materias Primas
      const resMat = await fetch("http://127.0.0.1:8000/materia-prima", { headers });
      const dataMat = await resMat.json();

      // 2. Cargar Proveedores (Reutilizamos endpoint de productos)
      const resProv = await fetch("http://127.0.0.1:8000/productos/proveedores", { headers });
      const dataProv = await resProv.json();

      setMateriales(dataMat);
      setProveedores(dataProv);

    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Guardar Material ---
  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("inventia_token");
    
    // Validación simple
    if (!formData.nombre || !formData.costo || !formData.stockActual) {
        setError("Por favor completa los campos obligatorios.");
        setIsSaving(false);
        return;
    }

    try {
        const body = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            costo: parseFloat(formData.costo),
            unidadMedida: formData.unidadMedida,
            stockActual: parseInt(formData.stockActual),
            proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null
        };

        const response = await fetch("http://127.0.0.1:8000/materia-prima", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error("Error al guardar el material.");
        }

        setSuccess("Material registrado correctamente.");
        setFormData({ nombre: "", descripcion: "", costo: "", unidadMedida: "unidades", stockActual: "", proveedor_id: "" });
        setCreateDialogOpen(false);
        fetchData();

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleViewDetails = (material: MateriaPrima) => {
    setSelectedMaterial(material);
    setDetailsDialogOpen(true);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🗳️ Inventario de Materia Prima</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Material
                </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Materia Prima</DialogTitle>
                    <DialogDescription>
                    Registra un nuevo insumo para producción.
                    </DialogDescription>
                </DialogHeader>

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <div className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-nombre" className="text-right">Nombre *</Label>
                    <Input 
                        id="mat-nombre" 
                        className="col-span-3" 
                        placeholder="Ej. Tela Azul Quirúrgica"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-desc" className="text-right">Descripción</Label>
                    <Input 
                        id="mat-desc" 
                        className="col-span-3" 
                        placeholder="Detalles técnicos"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mat-proveedor" className="text-right">Proveedor</Label>
                        <Select onValueChange={(val) => setFormData({...formData, proveedor_id: val})}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {proveedores.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                                ))}
                                {proveedores.length === 0 && <SelectItem value="0" disabled>Sin proveedores</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mat-unidad" className="text-right">Unidad *</Label>
                        <Select 
                            defaultValue="unidades"
                            onValueChange={(val) => setFormData({...formData, unidadMedida: val})}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Ej. metros" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="metros">Metros (m)</SelectItem>
                                <SelectItem value="kilogramos">Kilogramos (kg)</SelectItem>
                                <SelectItem value="unidades">Unidades (pz)</SelectItem>
                                <SelectItem value="litros">Litros (L)</SelectItem>
                                <SelectItem value="conos">Conos</SelectItem>
                                <SelectItem value="rollos">Rollos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-costo" className="text-right">Costo Unit. *</Label>
                    <Input 
                        id="mat-costo" 
                        type="number" 
                        className="col-span-3" 
                        placeholder="0.00"
                        value={formData.costo}
                        onChange={(e) => setFormData({...formData, costo: e.target.value})}
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mat-stock" className="text-right">Stock Inicial *</Label>
                    <Input 
                        id="mat-stock" 
                        type="number" 
                        className="col-span-3" 
                        placeholder="0"
                        value={formData.stockActual}
                        onChange={(e) => setFormData({...formData, stockActual: e.target.value})}
                    />
                    </div>
                    
                    <Button className="mt-4" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                        Guardar Material
                    </Button>
                </div>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* --- Modal de Detalles --- */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Ficha Técnica de Material</DialogTitle>
                <DialogDescription>Detalles del insumo registrado.</DialogDescription>
            </DialogHeader>
            {selectedMaterial && (
                <div className="grid gap-4 py-4">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Layers className="text-purple-500" />
                            {selectedMaterial.nombre}
                        </h3>
                        <Badge variant="outline" className="uppercase">{selectedMaterial.unidadMedida}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground font-semibold flex items-center gap-1"><DollarSign size={14}/> Costo Unitario:</span>
                            <span className="text-lg font-bold">${selectedMaterial.costo.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-muted-foreground font-semibold flex items-center gap-1"><Ruler size={14}/> Stock Disponible:</span>
                            <span className={selectedMaterial.stockActual < 50 ? "text-red-600 font-bold" : "text-green-700 font-bold"}>
                                {selectedMaterial.stockActual} {selectedMaterial.unidadMedida}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1 bg-gray-50 p-3 rounded-md border mt-2">
                        <span className="text-muted-foreground font-semibold text-xs uppercase">Proveedor Principal:</span>
                        <p className="text-sm font-medium">{selectedMaterial.proveedor?.nombre || "No asignado"}</p>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                        <span className="text-muted-foreground font-semibold text-xs uppercase">Descripción:</span>
                        <p className="text-sm text-gray-600">{selectedMaterial.descripcion || "Sin detalles adicionales."}</p>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="secondary" onClick={() => setDetailsDialogOpen(false)}>Cerrar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabla de Materia Prima */}
      <Card>
        <CardHeader>
          <CardTitle>Listado General de Materiales</CardTitle>
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
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Costo Unit.</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {materiales.map((mat) => (
                    <TableRow key={mat.id}>
                    <TableCell>{mat.id}</TableCell>
                    <TableCell className="font-medium">{mat.nombre}</TableCell>
                    <TableCell>{mat.proveedor ? mat.proveedor.nombre : '-'}</TableCell>
                    <TableCell>${mat.costo.toFixed(2)}</TableCell>
                    <TableCell>{mat.unidadMedida}</TableCell>
                    <TableCell className={mat.stockActual < 100 ? "text-red-500 font-bold" : ""}>{mat.stockActual}</TableCell>
                    <TableCell className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(mat)}>
                            <Eye className="w-4 h-4 mr-1 text-gray-500" /> Detalles
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                 {materiales.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                            No hay materiales registrados aún.
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