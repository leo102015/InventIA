"use client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Datos ficticios (RF-13)
const mockOrdenesVenta = [
  { id: "ML-1029", canal: "Mercado Libre", producto: "Pijama Roja (S) (x2)", total: 798.00, estado: "En producción" },
  { id: "SHN-2045", canal: "Shein", producto: "Sábana Matrimonial (x1)", total: 599.00, estado: "Pagada" },
  { id: "AMZ-5051", canal: "Amazon", producto: "Pijama Azul (M) (x1)", total: 399.00, estado: "En producción" },
  { id: "TMU-8812", canal: "Temu", producto: "Sábana Individual (x3)", total: 1350.00, estado: "Enviada" },
  { id: "ML-1028", canal: "Mercado Libre", producto: "Pijama Azul (L) (x1)", total: 399.00, estado: "Entregada" },
];

export default function VentasPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">🛒 Órdenes de Venta</h1>
      
      {/* Filtros (RF-14) */}
      <div className="flex gap-4 mb-4">
        <Input placeholder="Buscar por ID de Orden..." className="max-w-xs" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los Canales</SelectItem>
            <SelectItem value="ml">Mercado Libre</SelectItem>
            <SelectItem value="shein">Shein</SelectItem>
            <SelectItem value="amz">Amazon</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="en_produccion">
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los Estados</SelectItem>
            <SelectItem value="en_produccion">En Producción (Sobreventa)</SelectItem>
            <SelectItem value="pagada">Pagada</SelectItem>
            <SelectItem value="enviada">Enviada</SelectItem>
            <SelectItem value="entregada">Entregada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de Ventas (RF-13) */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Orden</TableHead>
                <TableHead>Canal de Venta</TableHead>
                <TableHead>Producto(s)</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrdenesVenta.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell className="font-medium">{orden.id}</TableCell>
                  <TableCell>{orden.canal}</TableCell>
                  <TableCell>{orden.producto}</TableCell>
                  <TableCell>${orden.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={orden.estado === 'En producción' ? 'destructive' : 
                                    (orden.estado === 'Pagada' ? 'secondary' : 'default')}>
                      {orden.estado}
                    </Badge>
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

