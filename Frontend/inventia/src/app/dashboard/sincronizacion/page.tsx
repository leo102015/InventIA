"use client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

// Datos ficticios (RF-11)
const mockCanales = [
  { nombre: "Mercado Libre", estado: "Conectado", ultimaSinc: "Hace 1 min" },
  { nombre: "Shein", estado: "Conectado", ultimaSinc: "Hace 2 min" },
  { nombre: "Walmart", estado: "Error", ultimaSinc: "Hace 1 hora" },
  { nombre: "Amazon", estado: "Conectado", ultimaSinc: "Hace 5 min" },
  { nombre: "Temu", estado: "Conectado", ultimaSinc: "Hace 3 min" },
];

// Datos ficticios (RF-12 Log)
const mockLogs = [
  { fecha: "2025-10-29 10:30:01", canal: "Mercado Libre", sku: "PJM-AZL-M", stock: 149, desc: "Venta ML-1029 detectada." },
  { fecha: "2025-10-29 10:30:02", canal: "Shein", sku: "PJM-AZL-M", stock: 149, desc: "Sincronizando stock." },
  { fecha: "2025-10-29 10:30:03", canal: "Amazon", sku: "PJM-AZL-M", stock: 149, desc: "Sincronizando stock." },
  { fecha: "2025-10-29 10:28:00", canal: "Walmart", sku: "SAB-MAT-Q", stock: 0, desc: "Error de API al sincronizar." },
];

export default function SincronizacionPage() {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">⚡ Sincronización Multicanal</h1>
        <Button>Conectar Nuevo Canal</Button>
      </div>

      <Tabs defaultValue="estado_canales" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="estado_canales">Estado de Canales</TabsTrigger>
          <TabsTrigger value="log_actividad">Log de Actividad</TabsTrigger>
        </TabsList>
        
        {/* Pestaña Estado de Canales (RF-11) */}
        <TabsContent value="estado_canales" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCanales.map((canal) => (
              <Card key={canal.nombre}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {canal.nombre}
                    <Badge variant={canal.estado === 'Conectado' ? 'default' : 'destructive'}>
                      {canal.estado === 'Conectado' ? <CheckCircle className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
                      {canal.estado}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-2 h-4 w-4" />
                    Última sincronización: {canal.ultimaSinc}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">Configurar</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Pestaña Log de Actividad (RF-12) */}
        <TabsContent value="log_actividad" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Sincronización en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock Enviado</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLogs.map((log) => (
                    <TableRow key={log.fecha}>
                      <TableCell>{log.fecha}</TableCell>
                      <TableCell>{log.canal}</TableCell>
                      <TableCell>{log.sku}</TableCell>
                      <TableCell>{log.stock}</TableCell>
                      <TableCell className={log.desc.includes('Error') ? "text-red-500" : ""}>{log.desc}</TableCell>
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

