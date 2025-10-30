"use client"; // Necesario para usar hooks como useState

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Package,
  Factory,
  Zap,
  ShoppingCart,
  Truck,
  Brain,
  FileText,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Boxes,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils'; // Asegúrate que este path es correcto

// --- 1. Definición de los links del menú ---
const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/inventario-producto", label: "Inventario Producto", icon: Package },
  { href: "/dashboard/inventario-materia", label: "Inventario Materia Prima", icon: Boxes },
  { href: "/dashboard/produccion", label: "Producción", icon: Factory },
  { href: "/dashboard/sincronizacion", label: "Sincronización", icon: Zap },
  { href: "/dashboard/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/dashboard/compras", label: "Compras", icon: Truck },
  { href: "/dashboard/informes-ia", label: "Informes/IA", icon: Brain },
  { href: "/dashboard/reportes", label: "Reportes", icon: FileText },
];

// --- 2. Componente de Navegación (para reutilizar en móvil y desktop) ---
function NavContent() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-2 p-4">
      {navLinks.map((link) => (
        <Button
          key={link.label}
          asChild
          variant={pathname === link.href ? "secondary" : "ghost"} // Resalta el link activo
          className="justify-start gap-3"
        >
          <Link href={link.href}>
            <link.icon size={20} />
            <span className="truncate">{link.label}</span>
          </Link>
        </Button>
      ))}
      <hr className="my-4 border-gray-700" />
      <Button
        asChild
        variant="ghost"
        className="justify-start gap-3 text-red-500 hover:text-red-400"
      >
        <Link href="/">
          <LogOut size={20} />
          <span className="truncate">Cerrar Sesión</span>
        </Link>
      </Button>
    </nav>
  );
}

// --- 3. Componente de Navegación (para reutilizar en móvil y desktop COLAPSADO) ---
function NavContentCollapsed() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-2 p-4 items-center">
      {navLinks.map((link) => (
        <Button
          key={link.label}
          asChild
          variant={pathname === link.href ? "secondary" : "ghost"}
          size="icon"
          title={link.label} // Tooltip en hover
        >
          <Link href={link.href}>
            <link.icon size={20} />
          </Link>
        </Button>
      ))}
      <hr className="my-4 border-gray-700 w-full" />
      <Button
        asChild
        variant="ghost"
        size="icon"
        title="Cerrar Sesión"
        className="text-red-500 hover:text-red-400"
      >
        <Link href="/">
          <LogOut size={20} />
        </Link>
      </Button>
    </nav>
  );
}


// --- 4. El Layout Principal ---
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Estado para controlar la barra lateral en ESCRITORIO (colapsada o no)
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* --- BARRA LATERAL (Desktop) --- */}
      <aside className={cn(
        "hidden md:flex flex-col bg-gray-900 text-white fixed inset-y-0 left-0 z-10 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <Image
            src="/inventia_logo.jpg"
            alt="InventIA Logo"
            width={isCollapsed ? 40 : 80}
            height={isCollapsed ? 40 : 80}
            className="rounded-full transition-all duration-300"
          />
        </div>
        
        {/* Contenido de la navegación (cambia si está colapsado) */}
        {isCollapsed ? <NavContentCollapsed /> : <NavContent />}

        {/* Botón para colapsar (solo en desktop) */}
        <div className="mt-auto p-4 border-t border-gray-700">
          <Button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            variant="ghost" 
            size="icon"
            className="w-full"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </Button>
        </div>
      </aside>

      {/* --- ÁREA DE CONTENIDO (Header Móvil + Contenido de página) --- */}
      <div className={cn(
        "flex flex-col flex-1 w-full transition-all duration-300",
        isCollapsed ? "md:pl-20" : "md:pl-64" // Ajusta el margen izquierdo del contenido
      )}>
        
        {/* --- HEADER (Móvil y Desktop) --- */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
          
          {/* --- Botón de Menú (Móvil) --- */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden" // Oculto en desktop
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-gray-900 text-white border-0">
              <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <Image
                  src="/inventia_logo.jpg"
                  alt="InventIA Logo"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
          
          {/* Título de la empresa (logo de Hadros) */}
          <div className="flex-1">
            <Image
              src="/hadros_logo.jpg"
              alt="Hadros Logo"
              width={35}
              height={35}
              className="rounded-full"
              title="Hadros Uniformes"
            />
          </div>

          {/* Menú de Usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <span className="sr-only">Toggle user menu</span>
                LP {/* Placeholder para iniciales de usuario */}
              </Button>
            </DropdownMenuTrigger>            
          </DropdownMenu>
        </header>
        
        {/* --- CONTENIDO PRINCIPAL DE LA PÁGINA --- */}
        <main className="flex-1 p-4 md:p-8 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
