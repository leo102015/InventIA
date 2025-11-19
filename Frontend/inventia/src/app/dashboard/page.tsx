"use client"; // Necesario para hooks como useState y useEffect

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Loader2 } from 'lucide-react'; // Importar icono de carga

// --- 1. Definir la "forma" de los datos del dashboard ---
// Esto debe coincidir con el Pydantic model 'DashboardStats' del backend
interface DashboardStats {
  ventas_netas: number;
  ordenes_pendientes: number;
  tiempo_proceso: string;
  canales_ok: string;
}

// --- 2. Componente KpiCard (sin cambios) ---
function KpiCard({ title, value, subtext, delta, deltaColor = "normal" }: {
  title: string,
  value: string | number, // Actualizado para aceptar números
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
          <p className={`text-xs ${colorClass}`}>{delta}% {deltaColor === "inverse" ? "above target" : "from last month"}</p>
        )}
      </CardContent>
    </Card>
  );
}

// --- 3. Página Principal del Dashboard (Actualizada) ---
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Función asíncrona para cargar los datos
    const fetchDashboardData = async () => {
      // 1. Obtener el token de localStorage
      const token = localStorage.getItem('inventia_token');
      
      if (!token) {
        // Si no hay token, no estamos autenticados.
        // Redirigir al login.
        setError('No estás autenticado.');
        router.push('/');
        return;
      }

      try {
        // 2. Hacer la llamada (fetch) al endpoint protegido
        const response = await fetch('http://127.0.0.1:8000/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // ¡Enviar el token es clave!
          },
        });

        if (response.status === 401) {
          // Token inválido o expirado
          setError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
          localStorage.removeItem('inventia_token'); // Limpiar token malo
          router.push('/'); // Enviar al login
          return;
        }
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos del dashboard');
        }

        const data: DashboardStats = await response.json();
        setStats(data); // 3. Guardar los datos en el estado

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false); // 4. Dejar de cargar
      }
    };

    fetchDashboardData();
  }, [router]); // El 'router' se incluye como dependencia del hook

  // --- 4. Renderizado Condicional ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="ml-2 text-lg">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si todo salió bien y tenemos datos (stats)
  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">🏠 Dashboard Principal (Hadros)</h1>
      
      {/* 5. KPIs Dinámicos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats && (
          <>
            <KpiCard 
              title="VENTAS NETAS (Últ. 30 D)"
              value={`$${stats.ventas_netas.toLocaleString('es-MX')} MXN`}
              subtext=""
              delta={5.2} // (Este delta puede venir del backend también)
              deltaColor="normal"
            />
            <KpiCard 
              title="ÓRDENES PENDIENTES"
              value={`${stats.ordenes_pendientes} para despachar`}
              subtext="ML: 5 | Shein: 4" // (Subtexto también puede ser dinámico)
            />
            <KpiCard 
              title="TIEMPO PROCESO VENTA (Manual)"
              value={stats.tiempo_proceso}
              subtext="Meta: 5 min"
              deltaColor="inverse"
            />
            <KpiCard 
              title="ESTADO SINCRONIZACIÓN"
              value={`${stats.canales_ok} Canales OK`}
              subtext="Walmart/Amazon - Revisar"
              deltaColor="inverse"
            />
          </>
        )}
      </div>

      <hr className="my-6" />

      {/* Alertas (Estas pueden seguir siendo estáticas o cargarse
          desde otro endpoint de "alertas" en el futuro) */}
      <h2 className="text-2xl font-semibold mb-4">⚠️ Alertas de Producción y Stock Crítico</h2>
      <div className="flex flex-col gap-4 mb-6">
        <Alert variant="default" className="bg-yellow-100 border-yellow-400 text-yellow-800">
          <AlertTitle>⚠️ ALERTA (Materia Prima)</AlertTitle>
          <AlertDescription>
            Bajo nivel de **Tela Algodón Azul (Metro)**. [Generar Orden de Compra Sugerida]
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>🚨 ALERTA (Pijama)</AlertTitle>
          <AlertDescription>
            ¡Pijama Modelo A-Talla M bajo stock! 5 unidades disponibles. [Ir a Producción]
          </AlertDescription>
        </Alert>
      </div>

      <hr className="my-6" />

      {/* Sugerencia IA (Igual que las alertas, puede ser otro endpoint) */}
      <h2 className="text-2xl font-semibold mb-4">🤖 Sugerencia Estratégica IA</h2>
      <Alert variant="default" className="bg-blue-100 border-blue-400 text-blue-800 mb-6">
        <AlertTitle>Acción Recomendada</AlertTitle>
        <AlertDescription>
          <p>Aplicar **15% de Descuento** en **Sábanas Modelo X** en Amazon.</p>
          <p className="text-sm mt-1">**Motivo (IA):** Baja rotación histórica del SKU y alta demanda proyectada para el próximo mes.</p>
        </AlertDescription>
      </Alert>
      
    </section>
  );
}