import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Asumiendo Shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Asumiendo Shadcn/ui
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Asumiendo Shadcn/ui
import { Button } from "@/components/ui/button"; // Asumiendo Shadcn/ui

// Esta es la página de Producción
export default function Produccion() {
  
  // Datos simulados para las tablas
  const data_mp = [
    { id: 1, materia: 'Tela Algodón Azul', unidad: 'Metro', stock: 500, costo: '$15.00', alerta: 'Crítico' },
    { id: 2, materia: 'Hilo Blanco', unidad: 'Cono', stock: 45, costo: '$5.00', alerta: 'OK' },
    { id: 3, materia: 'Botones (Modelo X)', unidad: 'Unidad', stock: 3000, costo: '$0.50', alerta: 'OK' },
  ];

  const data_op = [
    { id: 'OP-0015', producto: 'Pijama Modelo A - Talla M', cantidad: 100, estado: '✅ Finalizada' },
    { id: 'OP-0016', producto: 'Pijama Modelo B - Talla S', cantidad: 50, estado: '🟡 En Taller' },
  ];

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">🧵 Producción y Materia Prima</h1>

      {/* Reemplazamos st.tabs con el componente Tabs de Shadcn/ui */}
      <Tabs defaultValue="materia_prima">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materia_prima">Inventario de Materia Prima</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes de Producción (OP)</TabsTrigger>
          <TabsTrigger value="bom">Listas de Materiales (BOM)</TabsTrigger>
        </TabsList>

        {/* 1. INVENTARIO DE MATERIA PRIMA */}
        <TabsContent value="materia_prima" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Materia Prima (Entradas/Salidas)</CardTitle>
              <Button size="sm" className="mt-2">➕ Agregar Nueva Materia Prima</Button>
            </CardHeader>
            <CardContent>
              {/* Reemplazamos st.dataframe con el componente Table de Shadcn/ui */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materia Prima</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Costo Unitario</TableHead>
                    <TableHead>Alerta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data_mp.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.materia}</TableCell>
                      <TableCell>{item.unidad}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>{item.costo}</TableCell>
                      <TableCell className={item.alerta === 'Crítico' ? 'text-red-500 font-bold' : ''}>{item.alerta}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg mt-4">
                💡 **Dato clave para Hadros:** Se registra el proveedor y el costo de cada materia prima. [cite_start]La unidad de medida para la tela es el metro. [cite: 57, 58, 59]
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. ÓRDENES DE PRODUCCIÓN (OP) */}
        <TabsContent value="ordenes" className="mt-4">
           {/* ... (Construirías esto de forma similar con Card y Table) ... */}
           <p>Módulo de Órdenes de Producción en construcción...</p>
        </TabsContent>

        {/* 3. LISTAS DE MATERIALES (BOM) */}
        <TabsContent value="bom" className="mt-4">
           {/* ... (Construirías esto con Card, Input y Textarea) ... */}
           <p>Módulo de Listas de Materiales (BOM) en construcción...</p>
           <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg mt-4">
            [cite_start]Para la fabricación de pijamas, existe una medida estándar de tela, hilo y botones. [cite: 13, 14]
           </p>
        </TabsContent>
      </Tabs>
    </section>
  );
}

/* NOTA: Para que este código funcione, necesitarás crear los componentes 
Card y CardHeader, etc. o (preferiblemente) instalarlos desde Shadcn/ui.
Por simplicidad, los he omitido aquí, pero el código de arriba
asume que los tienes.
*/