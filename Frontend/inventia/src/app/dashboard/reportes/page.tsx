"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileDown } from "lucide-react";

export default function ReportesPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">📄 Generador de Reportes</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configurar Reporte</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Selector de Tipo de Reporte (RF-19) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="reporte-tipo">1. Selecciona el tipo de reporte</Label>
            <Select>
              <SelectTrigger id="reporte-tipo">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ventas">Reporte de Ventas</SelectItem>
                <SelectItem value="inv-producto">Reporte de Inventario (Producto Terminado)</SelectItem>
                <SelectItem value="inv-materia">Reporte de Inventario (Materia Prima)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Rango de Fecha (RF-20) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="reporte-fecha">2. Selecciona el rango de fecha</Label>
            <Select>
              <SelectTrigger id="reporte-fecha">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoy">Hoy (Diario)</SelectItem>
                <SelectItem value="semana">Semana Actual</SelectItem>
                <SelectItem value="mes">Mes Actual (Mensual)</SelectItem>
                <SelectItem value="custom">Personalizado (Próximamente...)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button size="lg" className="mt-4">
            <FileDown className="mr-2 h-5 w-5" />
            Generar y Exportar (.CSV)
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

