import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Usaremos esto para los estados

// Esta es la página de Inventario
export default function Inventario() {

  // --- Datos simulados de inventario.py ---
  const data_inventario = [
    { producto: 'Pijama Mod. A', tipo: 'Fabricación', sku: '001-PMA', stock: 320, canales: '4/4' },
    { producto: 'Pijama Mod. B', tipo: 'Fabricación', sku: '002-PMB', stock: 150, canales: '4/4' },
    { producto: 'Sábana Premium', tipo: 'Reventa', sku: '101-SAP', stock: 450, canales: '3/4' },
    { producto: 'Sábana Económica', tipo: 'Reventa', sku: '102-SAE', stock: 800, canales: '4/4' },
  ];

  const data_variantes = [
    { tallaColor: 'M - Azul Marino', sku: '001-PMA-M-AZM', stockC: 120, stockML: 120, stockS: 120 },
    { tallaColor: 'L - Azul Marino', sku: '001-PMA-L-AZM', stockC: 90, stockML: 90, stockS: 90 },
    { tallaColor: 'M - Rojo', sku: '001-PMA-M-ROJ', stockC: 60, stockML: 60, stockS: 60 },
    { tallaColor: 'S - Azul', sku: '001-PMA-S-AZU', stockC: 50, stockML: 50, stockS: 50 },
  ];
  
  const data_desajustes = [
    { fecha: '2025-10-04', sku: '001-PMA-M-ROJ', dif: '-5 (Faltante)', origen: 'Venta duplicada en Amazon', estado: 'Corregido' },
    { fecha: '2025-09-28', sku: '101-SAP', dif: '+2 (Sobrante)', origen: 'Conteo Físico', estado: 'Corregido' },
    { fecha: '2025-09-20', sku: '002-PMB-L-GRS', dif: '-1 (Faltante)', origen: 'Merma no registrada', estado: 'Pendiente' },
  ];
  // --- Fin de datos simulados ---

  return (
    <section>
      <h1 className="text-3xl font-bold mb-2">📦 Módulo Inventario Central</h1>
      <p className="text-lg text-gray-600 mb-6">Pijamas y Sábanas: Visión General del Stock</p>

      {/* Reemplazamos st.tabs con el componente Tabs de Shadcn/ui */}
      <Tabs defaultValue="stock_general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock_general">Stock Central General</TabsTrigger>
          <TabsTrigger value="variantes">Gestión de Variantes</TabsTrigger>
          <TabsTrigger value="desajustes">Reporte de Desajustes</TabsTrigger>
        </TabsList>

        {/* 1. STOCK CENTRAL GENERAL (Tab 1) */}
        <TabsContent value="stock_general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventario General</CardTitle>
              <p className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg mt-2">
                Mostrando productos de **Fabricación** y **Reventa** juntos, como se solicitó en la encuesta (RF-01).
              </p>
            </CardHeader>
            <CardContent>
              {/* Reemplazamos st.dataframe con Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>SKU Base</TableHead>
                    <TableHead>Stock Total Central</TableHead>
                    <TableHead>Canales Sinc.</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data_inventario.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-medium">{item.producto}</TableCell>
                      <TableCell>
                        <Badge variant={item.tipo === 'Fabricación' ? 'default' : 'secondary'}>{item.tipo}</Badge>
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-center">{item.stock}</TableCell>
                      <TableCell className={item.canales === '4/4' ? 'text-green-600' : 'text-yellow-600'}>{item.canales}</TableCell>
                      <TableCell><Button variant="outline" size="sm">Ver Detalles</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <hr className="my-6" />
              
              {/* Reemplazamos st.columns para el estado de sincronización */}
              <h3 className="text-lg font-semibold mb-4">Estado de Sincronización Multicanal (Tiempo Real)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Badge className="text-base p-3 justify-center bg-green-100 text-green-800">Mercado Libre: ✅ OK</Badge>
                <Badge className="text-base p-3 justify-center bg-green-100 text-green-800">SHEIN: ✅ OK</Badge>
                <Badge className="text-base p-3 justify-center bg-yellow-100 text-yellow-800">Amazon: 🟡 Revisar</Badge>
                <Badge className="text-base p-3 justify-center bg-green-100 text-green-800">Temu: ✅ OK</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. GESTIÓN DE VARIANTES (Tab 2) */}
        <TabsContent value="variantes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ajuste de Stock por Variantes</CardTitle>
              <p className="text-sm text-gray-500">Recordatorio: Hadros maneja mucha variedad de colores y tallas en pijamas.</p>
            </CardHeader>
            <CardContent>
              {/* Reemplazamos st.selectbox con Select */}
              <Select defaultValue="pma">
                <SelectTrigger className="w-[300px] mb-4">
                  <SelectValue placeholder="Seleccionar Producto Base" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pma">Pijama Mod. A (001-PMA)</SelectItem>
                  <SelectItem value="pmb">Pijama Mod. B (002-PMB)</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Reemplazamos st.dataframe de variantes con Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talla/Color</TableHead>
                    <TableHead>SKU Completo</TableHead>
                    <TableHead>Stock Central</TableHead>
                    <TableHead>Stock ML</TableHead>
                    <TableHead>Stock Shein</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data_variantes.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-medium">{item.tallaColor}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="font-bold text-center">{item.stockC}</TableCell>
                      <TableCell className="text-center">{item.stockML}</TableCell>
                      <TableCell className="text-center">{item.stockS}</TableCell>
                      <TableCell><Button variant="outline" size="sm">Ajuste</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <hr className="my-6" />
              
              {/* Reemplazamos st.expander con Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Crear Nueva Variante de Producto</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 p-4">
                      <Input placeholder="Nueva Talla/Color (ej: XL - Verde)" />
                      <Input type="number" placeholder="Stock Inicial" />
                      <Button>Crear y Sincronizar Variante</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. REPORTE DE DESAJUSTES (Tab 3) */}
        <TabsContent value="desajustes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Desajustes y Errores</CardTitle>
              <p className="text-sm text-gray-500">En promedio, se detectan diferencias 2 a 3 veces al mes.</p>
            </CardHeader>
            <CardContent>
              <Button className="mb-4">Reportar Nuevo Desajuste Manual</Button>
              {/* Reemplazamos st.dataframe de desajustes con Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Diferencia</TableHead>
                    <TableHead>Origen Error</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data_desajustes.map((item) => (
                    <TableRow key={item.fecha}>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className={item.dif.includes('Faltante') ? 'text-red-600' : 'text-green-600'}>{item.dif}</TableCell>
                      <TableCell>{item.origen}</TableCell>
                      <TableCell>
                        <Badge variant={item.estado === 'Corregido' ? 'default' : 'destructive'}>{item.estado}</Badge>
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