"use client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ScanBarcode } from "lucide-react";

// Datos ficticios (RF-04)
const mockMateriales = [
  { id: "TLA-AZL", nombre: "Tela Azul Quirúrgica", proveedor: "Telas del Centro", costo: 85.50, unidad: "metros", stock: 1200 },
  { id: "HLO-BLN", nombre: "Hilo Blanco", proveedor: "Mercería La Ideal", costo: 15.00, unidad: "conos", stock: 500 },
  { id: "BTN-PLT", nombre: "Botón Plata", proveedor: "Mercería La Ideal", costo: 0.50, unidad: "unidades", stock: 10000 },
];

export default function InventarioMateriaPage() {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🗳️ Inventario de Materia Prima</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <ScanBarcode className="mr-2 h-4 w-4" />
            Iniciar Conteo Físico
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Materia Prima</DialogTitle>
                <DialogDescription>
                  Registra un nuevo insumo para producción.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mat-nombre" className="text-right">Nombre</Label>
                  <Input id="mat-nombre" placeholder="Ej. Tela Roja" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mat-proveedor" className="text-right">Proveedor</Label>
                  <Input id="mat-proveedor" placeholder="Ej. Telas del Centro" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mat-costo" className="text-right">Costo</Label>
                  <Input id="mat-costo" type="number" placeholder="80.00" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mat-unidad" className="text-right">Unidad</Label>
                  <Input id="mat-unidad" placeholder="metros, kg, unidades" className="col-span-3" />
                </div>
                <Button className="mt-4">Guardar Material</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabla de Materia Prima (RF-04) */}
      <Card>
        <CardHeader>
          <CardTitle>Listado General de Materiales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Material</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMateriales.map((mat) => (
                <TableRow key={mat.id}>
                  <TableCell>{mat.id}</TableCell>
                  <TableCell className="font-medium">{mat.nombre}</TableCell>
                  <TableCell>{mat.proveedor}</TableCell>
                  <TableCell>${mat.costo.toFixed(2)}</TableCell>
                  <TableCell>{mat.unidad}</TableCell>
                  <TableCell className={mat.stock < 100 ? "text-red-500 font-bold" : ""}>{mat.stock}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="ghost" size="sm">Movimientos</Button>
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

