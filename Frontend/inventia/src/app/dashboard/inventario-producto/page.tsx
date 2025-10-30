"use client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileDown, ScanBarcode } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Datos ficticios para la tabla
const mockProductos = [
  { sku: "PJM-AZL-M", nombre: "Pijama Azul Marino", variantes: 5, stock: 150, precio: 399.00, tipo: "Fabricación" },
  { sku: "SAB-MAT-Q", nombre: "Sábana Matrimonial", variantes: 1, stock: 80, precio: 599.00, tipo: "Reventa" },
  { sku: "PJM-RJO-S", nombre: "Pijama Roja", variantes: 3, stock: 0, precio: 399.00, tipo: "Fabricación" },
  { sku: "SAB-IND-B", nombre: "Sábana Individual Blanca", variantes: 1, stock: 120, precio: 450.00, tipo: "Reventa" },
];

export default function InventarioProductoPage() {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 Inventario de Producto Terminado</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <ScanBarcode className="mr-2 h-4 w-4" />
            Iniciar Conteo Físico
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Selecciona el tipo de producto que deseas registrar.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="fabricacion" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fabricacion">Fabricación Propia</TabsTrigger>
                  <TabsTrigger value="reventa">Reventa</TabsTrigger>
                </TabsList>
                {/* Pestaña para Producto de Fabricación (RF-06) */}
                <TabsContent value="fabricacion">
                  <div className="flex flex-col gap-4 py-4">
                    <p className="text-sm text-gray-500">Registra un producto base. Podrás agregar variantes (talla, color) y su Lista de Materiales (BOM) después de crearlo.</p>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-fab-nombre" className="text-right">Nombre</Label>
                      <Input id="prod-fab-nombre" placeholder="Ej. Pijama Quirúrgica" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-fab-sku" className="text-right">SKU Base</Label>
                      <Input id="prod-fab-sku" placeholder="Ej. PJM-QRG" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-fab-precio" className="text-right">Precio Venta</Label>
                      <Input id="prod-fab-precio" type="number" placeholder="399.00" className="col-span-3" />
                    </div>
                    <Button className="mt-4">Guardar Producto de Fabricación</Button>
                  </div>
                </TabsContent>
                {/* Pestaña para Producto de Reventa (RF-05) */}
                <TabsContent value="reventa">
                  <div className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-nombre" className="text-right">Nombre</Label>
                      <Input id="prod-rev-nombre" placeholder="Ej. Sábana Matrimonial" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-proveedor" className="text-right">Proveedor</Label>
                      <Input id="prod-rev-proveedor" placeholder="Proveedor de Sábanas" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-costo" className="text-right">Costo Compra</Label>
                      <Input id="prod-rev-costo" type="number" placeholder="250.00" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-precio" className="text-right">Precio Venta</Label>
                      <Input id="prod-rev-precio" type="number" placeholder="599.00" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="prod-rev-stock" className="text-right">Stock Inicial</Label>
                      <Input id="prod-rev-stock" type="number" placeholder="100" className="col-span-3" />
                    </div>
                    <Button className="mt-4">Guardar Producto de Reventa</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabla de Productos (RF-01) */}
      <Card>
        <CardHeader>
          <CardTitle>Listado General de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Precio Venta</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProductos.map((prod) => (
                <TableRow key={prod.sku}>
                  <TableCell>{prod.sku}</TableCell>
                  <TableCell className="font-medium">{prod.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={prod.tipo === 'Fabricación' ? 'default' : 'secondary'}>{prod.tipo}</Badge>
                  </TableCell>
                  <TableCell className={prod.stock === 0 ? "text-red-500 font-bold" : ""}>{prod.stock}</TableCell>
                  <TableCell>${prod.precio.toFixed(2)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="ghost" size="sm">Movimientos</Button>
                    {prod.tipo === 'Fabricación' && (
                      <Button variant="ghost" size="sm">Editar BOM</Button>
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

