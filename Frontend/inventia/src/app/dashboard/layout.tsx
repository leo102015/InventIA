import Link from 'next/link';
import Image from 'next/image';
import { Home, Package, Trello, Factory, ShoppingCart, BarChart2, Zap } from 'lucide-react'; // Iconos de https://lucide.dev/

/* Este es el "Sidebar" que definiste en app.py.
Lo construimos con TailwindCSS.
*/
function Sidebar() {
  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white p-5">
      {/* Logo de InventIA */}
      <div className="flex justify-center mb-10">
        <Image 
          src="/inventia_logo.jpg" // Desde la carpeta /public
          alt="InventIA Logo" 
          width={150} 
          height={150} 
          className="rounded-lg"
        />
      </div>

      <nav className="flex flex-col gap-4">
        {/* Esto reemplaza st.sidebar.radio */}
        <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700">
          <Home size={20} /> 🏠 Dashboard
        </Link>
        <Link href="/dashboard/inventario" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700">
          <Package size={20} /> 📦 Inventario Central
        </Link>
        <Link href="/dashboard/produccion" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700">
          <Factory size={20} /> 🧵 Producción
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 opacity-50">
          <ShoppingCart size={20} /> 🛒 Órdenes/Ventas
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 opacity-50">
          <BarChart2 size={20} /> 🤖 IA Sugerencias
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 opacity-50">
          <Zap size={20} /> 🔗 Integraciones
        </Link>
      </nav>

      {/* Footer del Sidebar */}
      <div className="absolute bottom-5 left-5 w-full pr-10">
        <hr className="border-gray-600 mb-4" />
        <div className="flex items-center gap-3">
          <Image src="/hadros_logo.jpg" alt="Hadros Logo" width={40} height={40} className="rounded-full" />
          <div>
            <p className="font-bold">HADROS UNIFORMES</p>
            <p className="text-xs text-gray-400">Versión: A Medida (Hadros)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
Este es el layout principal. 
Renderiza el Sidebar y luego el contenido de la página actual (el 'children').
*/
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      {/* Contenido de la página con un padding a la izquierda para no quedar debajo del sidebar */}
      <main className="flex-1 ml-64 p-8 bg-gray-100 min-h-screen">
        {/* Aquí es donde se cargarán tus páginas: page.tsx, inventario/page.tsx, etc. */}
        {children}
      </main>
    </div>
  );
}