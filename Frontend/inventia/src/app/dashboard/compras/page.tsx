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
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";

// Datos ficticios (RF-15)
const mockOrdenesCompra = [
  { id: "OC-001", proveedor: "Telas del Centro", fecha: "2025-10-25", estado: "Recibida" },
  { id: "OC-002", proveedor: "Mercería La Ideal", fecha: "2025-10-28", estado: "Solicitada" },
  { id: "OC-003", proveedor: "Proveedor de Sábanas", fecha: "2025-10-29", estado: "En Tránsito" },
];

export default function ComprasPage() {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🚚 Compras</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Orden de Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nueva Orden de Compra (RF-15)</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="oc-proveedor">Proveedor</Label>
                <Input id="oc-proveedor" placeholder="Seleccionar Proveedor..." />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="oc-items">Items (Simplificado)</Label>
                <Input id="oc-items" placeholder="Ej. 1000m Tela Azul, 50 Sábanas..." />
              </div>
              <Button className="mt-4">Guardar Orden de Compra</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Órdenes de Compra (RF-15) */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Órdenes de Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID OC</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrdenesCompra.map((oc) => (
                <TableRow key={oc.id}>
                  <TableCell className="font-medium">{oc.id}</TableCell>
                  <TableCell>{oc.proveedor}</TableCell>
                  <TableCell>{oc.fecha}</TableCell>
                  <TableCell>
                    <Badge variant={oc.estado === 'Recibida' ? 'default' : 'outline'}>{oc.estado}</Badge>
                  </TableCell>
                  <TableCell>
                    {oc.estado !== 'Recibida' && (
                      <Button variant="outline" size="sm">
                        Registrar Entrada
                      </Button>
                    )}
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

