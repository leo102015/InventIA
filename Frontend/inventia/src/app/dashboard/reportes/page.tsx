"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, Loader2, Search, Table as TableIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ReportesPage() {
  // Estado de Filtros
  const [tipoReporte, setTipoReporte] = useState("ventas");
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]); // Hoy
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]); // Hoy

  // Estado de Datos
  const [reportData, setReportData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generar Reporte
  const handleGenerate = async () => {
    setIsLoading(true);
    setReportData([]);
    try {
        const token = localStorage.getItem("inventia_token");
        let url = "";

        if (tipoReporte === "ventas") {
            url = `http://127.0.0.1:8000/reportes/ventas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        } else if (tipoReporte === "inv-producto") {
            url = `http://127.0.0.1:8000/reportes/inventario-producto`;
        } else if (tipoReporte === "inv-materia") {
            url = `http://127.0.0.1:8000/reportes/inventario-materia`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            setReportData(data);
            if (data.length > 0) {
                // Extraer keys del primer objeto para usarlos como headers de tabla
                setHeaders(Object.keys(data[0]));
            }
        } else {
            console.error("Error generando reporte");
        }
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };

  // Exportar CSV
  const handleExport = () => {
      if (reportData.length === 0) return;

      // Crear contenido CSV
      const csvHeaders = headers.join(",");
      const csvRows = reportData.map(row => 
        headers.map(fieldName => {
            const val = row[fieldName];
            // Escapar comillas y envolver en comillas si es string
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(",")
      );
      const csvString = [csvHeaders, ...csvRows].join("\n");

      // Descargar archivo
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Formatear encabezado para mostrar (ej. total_venta -> Total Venta)
  const formatHeader = (header: string) => {
      return header.replace(/_/g, " ").toUpperCase();
  };

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">📄 Generador de Reportes</h1>
      
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* --- PANEL DE CONFIGURACIÓN --- */}
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label>Tipo de Reporte</Label>
                    <Select value={tipoReporte} onValueChange={setTipoReporte}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ventas">Reporte de Ventas</SelectItem>
                            <SelectItem value="inv-producto">Inventario Producto (Valorizado)</SelectItem>
                            <SelectItem value="inv-materia">Inventario Materia Prima</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Filtros de Fecha (Solo visibles para Ventas) */}
                {tipoReporte === "ventas" && (
                    <div className="flex flex-col gap-4 p-3 bg-gray-50 rounded border">
                        <span className="text-xs font-bold text-gray-500 uppercase">Rango de Fechas</span>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs">Desde:</Label>
                            <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs">Hasta:</Label>
                            <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                        </div>
                    </div>
                )}

                <Button className="mt-2" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Search className="mr-2 h-4 w-4" />}
                    Generar Vista Previa
                </Button>
            </CardContent>
        </Card>

        {/* --- PANEL DE RESULTADOS --- */}
        <Card className="min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5 text-blue-500"/> Vista de Datos
                </CardTitle>
                {reportData.length > 0 && (
                    <Button variant="outline" onClick={handleExport} className="text-green-700 border-green-200 hover:bg-green-50">
                        <FileDown className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-2"/>
                        <p>Procesando datos...</p>
                    </div>
                ) : reportData.length > 0 ? (
                    <div className="border rounded-md overflow-x-auto max-w-[calc(100vw-400px)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {headers.map(h => (
                                        <TableHead key={h} className="whitespace-nowrap bg-gray-50 font-bold text-gray-700">
                                            {formatHeader(h)}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.map((row, idx) => (
                                    <TableRow key={idx}>
                                        {headers.map(h => (
                                            <TableCell key={h} className="whitespace-nowrap">
                                                {/* Formateo simple de valores */}
                                                {typeof row[h] === 'number' && (h.includes('total') || h.includes('precio') || h.includes('costo')) 
                                                    ? `$${row[h].toFixed(2)}` 
                                                    : row[h]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-300 border-2 border-dashed rounded-lg">
                        <TableIcon className="h-12 w-12 mb-2"/>
                        <p>Genera un reporte para ver los resultados aquí.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </section>
  );
}