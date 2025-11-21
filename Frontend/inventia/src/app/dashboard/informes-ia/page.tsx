"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
    Lightbulb, 
    TrendingDown, 
    TrendingUp, 
    AlertTriangle, 
    RefreshCw, 
    Loader2,
    Brain,
    PackageOpen
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface AnalisisProducto {
    id: number;
    nombre: string;
    tipo: string;
    stock_actual: number;
    total_vendido: number;
    estado_stock: "Crítico" | "Bajo" | "Normal" | "Agotado";
    rotacion: "Alta" | "Media" | "Baja" | "Nula";
}

interface Sugerencia {
    titulo: string;
    descripcion: string;
    accion_sugerida: string;
    producto_objetivo: string;
}

export default function InformesPage() {
  const [analisis, setAnalisis] = useState<AnalisisProducto[]>([]);
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
      setIsLoading(true);
      try {
          const token = localStorage.getItem("inventia_token");
          const res = await fetch("http://127.0.0.1:8000/ia/analisis", {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          setAnalisis(data.analisis_productos);
          setSugerencias(data.sugerencias);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => { fetchData(); }, []);

  // Filtrar datos para widgets
  const lowRotation = analisis.filter(p => p.rotacion === "Baja" || p.rotacion === "Nula");
  const criticalStock = analisis.filter(p => p.estado_stock === "Crítico" || p.estado_stock === "Agotado");

  const getRotationColor = (rot: string) => {
      if (rot === "Alta") return "bg-green-100 text-green-800";
      if (rot === "Media") return "bg-blue-100 text-blue-800";
      return "bg-red-100 text-red-800";
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="text-purple-600" />
            Centro de Inteligencia (IA)
        </h1>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Analizar Ahora
        </Button>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-12 w-12 text-purple-500 animate-spin mb-4" />
              <p className="text-lg text-gray-500">La IA está analizando tu inventario...</p>
          </div>
      ) : (
        <div className="grid gap-6">
            {/* SECCIÓN 1: SUGERENCIAS ESTRATÉGICAS */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-purple-800 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" /> Sugerencias de la IA
                        </CardTitle>
                        <CardDescription>Acciones recomendadas basadas en tus datos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sugerencias.map((sug, i) => (
                            <Alert key={i} className="bg-white border-purple-100 shadow-sm">
                                <AlertTitle className="font-bold text-purple-900 flex justify-between">
                                    {sug.titulo}
                                    <Badge variant="secondary">{sug.accion_sugerida}</Badge>
                                </AlertTitle>
                                <AlertDescription className="mt-2 text-gray-700">
                                    {sug.descripcion}
                                </AlertDescription>
                            </Alert>
                        ))}
                        {sugerencias.length === 0 && <p className="text-sm text-gray-500">Sin sugerencias por el momento.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" /> Stock Crítico / Agotado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-right">Stock</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {criticalStock.slice(0, 5).map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.nombre}</TableCell>
                                        <TableCell className="text-right text-red-600 font-bold">{p.stock_actual}</TableCell>
                                    </TableRow>
                                ))}
                                {criticalStock.length === 0 && (
                                    <TableRow><TableCell colSpan={2} className="text-center text-green-600 py-4">¡Todo en orden! No hay stock crítico.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* SECCIÓN 2: ANÁLISIS DE ROTACIÓN */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" /> Análisis de Rotación de Inventario
                    </CardTitle>
                    <CardDescription>Clasificación automática basada en frecuencia de ventas histórica.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-center">Ventas Totales</TableHead>
                                <TableHead className="text-center">Stock Actual</TableHead>
                                <TableHead className="text-center">Clasificación Rotación</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analisis.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.nombre}</TableCell>
                                    <TableCell>{p.tipo}</TableCell>
                                    <TableCell className="text-center">{p.total_vendido}</TableCell>
                                    <TableCell className="text-center">{p.stock_actual}</TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRotationColor(p.rotacion)}`}>
                                            {p.rotacion}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.rotacion === 'Baja' && p.stock_actual > 10 ? (
                                            <span className="text-xs text-orange-600 flex items-center justify-end gap-1">
                                                <TrendingDown size={14}/> Estancado
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">Ok</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      )}
    </section>
  );
}