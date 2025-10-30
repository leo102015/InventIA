"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Lightbulb } from "lucide-react";

// Componente placeholder para las gráficas
function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
      <p className="text-gray-400">{title}</p>
    </div>
  );
}

export default function InformesPage() {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🧠 Informes e Inteligencia Artificial</h1>
        <Select defaultValue="30d">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rango de Fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="90d">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget de Predicción (RF-17) */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Predicción de Demanda (Próximos 30 Días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder title="Gráfica de Predicción de Demanda" />
          </CardContent>
        </Card>

        {/* Widget de Sugerencias (RF-18) */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Lightbulb className="mr-2 h-5 w-5" />
              Sugerencias de la IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-blue-700">
              <li>**Fabricar 100 unidades** de "Pijama Roja (S)" (basado en predicción de ventas).</li>
              <li>**Pedir 500 metros** de "Tela Azul Quirúrgica" (stock bajo).</li>
              <li>Poner en oferta "Sábana Individual Blanca" (baja rotación).</li>
            </ul>
          </CardContent>
        </Card>

        {/* Widget Gráfica (RF-18) */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder title="Gráfica de Pastel" />
          </CardContent>
        </Card>

        {/* Widget Gráfica (RF-18) */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPlaceholder title="Gráfica de Barras" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

