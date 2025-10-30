"use client";
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
import { PlusCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Datos ficticios (RF-14)
const mockPedidosPorFabricar = [
  { orden: "ML-1029", producto: "Pijama Roja (S)", cantidad: 2, prioridad: "Alta" },
  { orden: "AMZ-5051", producto: "Pijama Azul (M)", cantidad: 1, prioridad: "Alta" },
];

// Datos ficticios (RF-08)
const mockLotes = [
  { id: "LOTE-001", producto: "Pijama Azul (M)", cantidad: 50, fecha: "2025-10-28", estado: "Terminado" },
  { id: "LOTE-002", producto: "Pijama Verde (L)", cantidad: 30, fecha: "2025-10-29", estado: "En Proceso" },
];

export default function ProduccionPage() {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🧵 Producción</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar Nuevo Lote
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Lote de Producción</DialogTitle>
              <DialogDescription>
                Registra un lote de productos fabricados en el taller.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prod-lote-prod" className="text-right">Producto</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pjm-azl">Pijama Azul (M)</SelectItem>
                    <SelectItem value="pjm-rja">Pijama Roja (S)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prod-lote-cant" className="text-right">Cantidad</Label>
                <Input id="prod-lote-cant" type="number" placeholder="50" className="col-span-3" />
              </div>
              <p className="text-sm text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                Al confirmar, se descontarán **125 metros** de Tela Azul y **25 conos** de Hilo (según BOM).
              </p>
              <Button className="mt-4">Confirmar y Terminar Lote</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pestañas para Cola de Producción y Lotes */}
      <Tabs defaultValue="cola_produccion" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cola_produccion">
            <AlertTriangle className="mr-2 h-4 w-4 text-red-500"/>
            Pedidos por Fabricar (Sobreventa)
          </TabsTrigger>
          <TabsTrigger value="historial_lotes">Historial de Lotes</TabsTrigger>
        </TabsList>
        
        {/* Pestaña Cola de Producción (RF-14) */}
        <TabsContent value="cola_produccion" className="mt-4">
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Cola de Producción Prioritaria</CardTitle>
              <p className="text-sm text-gray-500">Estas órdenes se generaron por sobreventa y deben fabricarse.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden (Canal)</TableHead>
                    <TableHead>Producto a Fabricar</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Prioridad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPedidosPorFabricar.map((pedido) => (
                    <TableRow key={pedido.orden}>
                      <TableCell>{pedido.orden}</TableCell>
                      <TableCell className="font-medium">{pedido.producto}</TableCell>
                      <TableCell>{pedido.cantidad}</TableCell>
                      <TableCell><Badge variant="destructive">{pedido.prioridad}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña Historial de Lotes (RF-08) */}
        <TabsContent value="historial_lotes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lotes de Producción Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Lote</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLotes.map((lote) => (
                    <TableRow key={lote.id}>
                      <TableCell>{lote.id}</TableCell>
                      <TableCell className="font-medium">{lote.producto}</TableCell>
                      <TableCell>{lote.cantidad}</TableCell>
                      <TableCell>{lote.fecha}</TableCell>
                      <TableCell>
                        <Badge variant={lote.estado === 'Terminado' ? 'default' : 'outline'}>{lote.estado}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

