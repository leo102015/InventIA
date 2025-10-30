import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Asumiendo Shadcn/ui
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Asumiendo Shadcn/ui
import { BarChart } from 'lucide-react'; // Iconos

/* Este es nuestro componente reutilizable para reemplazar "st.metric".
Usaremos el componente "Card" de Shadcn/ui.
*/
function KpiCard({ title, value, subtext, delta, deltaColor = "normal" }: {
  title: string,
  value: string,
  subtext: string,
  delta?: number,
  deltaColor?: string
}) {
  const colorClass = deltaColor === "inverse" ? "text-red-500" : "text-green-500";
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{subtext}</p>
        {delta && (
          <p className={`text-xs ${colorClass}`}>{delta}% {deltaColor === "inverse" ? "above target" : "desde el último mes"}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Esta es la página principal del Dashboard
export default function Dashboard() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">🏠 Dashboard Principal (Hadros)</h1>
      
      {/* Aquí replicamos st.columns(4) con un grid de 4 columnas de Tailwind */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard 
          title="VENTAS NETAS (Últ. 30 D)"
          value="$15,200 MXN"
          subtext=""
          delta={5.2}
          deltaColor="normal"
        />
        <KpiCard 
          title="ÓRDENES PENDIENTES"
          value="9 para despachar"
          subtext="ML: 5 | Shein: 4"
        />
        <KpiCard 
          title="TIEMPO PROCESO VENTA (Manual)"
          value="1 hora"
          subtext="Meta: 5 min"
          deltaColor="inverse"
        />
        <KpiCard 
          title="ESTADO SINCRONIZACIÓN"
          value="3/5 Canales OK"
          subtext="Walmart/Amazon - Revisar"
          deltaColor="inverse"
        />
      </div>

      <hr className="my-6" />

      {/* Alertas */}
      <h2 className="text-2xl font-semibold mb-4">⚠️ Alertas de Producción y Stock Crítico</h2>
      <div className="flex flex-col gap-4 mb-6">
        <Alert variant="default" className="bg-yellow-100 border-yellow-400 text-yellow-800">
          <AlertTitle>⚠️ ALERTA (Materia Prima)</AlertTitle>
          <AlertDescription>
            Bajo nivel de **Tela Algodón Azul (Metro)**. [Generar Orden de Compra Sugerida]
          </AlertDescription>
        </Alert>
        <Alert variant="destructive"> {/* variant="destructive" le da el color rojo */}
          <AlertTitle>🚨 ALERTA (Pijama)</AlertTitle>
          <AlertDescription>
            ¡Pijama Modelo A-Talla M bajo stock! 5 unidades disponibles. [Ir a Producción]
          </AlertDescription>
        </Alert>
      </div>

      <hr className="my-6" />

      {/* Sugerencia IA */}
      <h2 className="text-2xl font-semibold mb-4">🤖 Sugerencia Estratégica IA</h2>
      <Alert variant="default" className="bg-blue-100 border-blue-400 text-blue-800 mb-6">
        <AlertTitle>Acción Recomendada</AlertTitle>
        <AlertDescription>
          <p>Aplicar **15% de Descuento** en **Sábanas Modelo X** en Amazon.</p>
          <p className="text-sm mt-1">**Motivo (IA):** Baja rotación histórica del SKU y alta demanda proyectada para el próximo mes.</p>
        </AlertDescription>
      </Alert>

      {/* Aquí irían las gráficas (puedes usar 'recharts' o 'chart.js') */}
      
    </section>
  );
}
