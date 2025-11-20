"use client"; // Necesario para usar hooks como useState y useRouter

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  LayoutGrid,
  User,
  Hammer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

// --- 1. Definición de los links del menú ---
const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/inventario-producto", label: "Inventario Producto", icon: Package },
  { href: "/dashboard/inventario-materia", label: "Inventario Materia Prima", icon: Boxes },
  { href: "/dashboard/lista-materiales", label: "Lista de Materiales (BOM)", icon: Hammer },
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
  const router = useRouter();

  const handleLogout = () => {
    // 1. Eliminar el token de seguridad
    localStorage.removeItem('inventia_token');
    // 2. Redirigir al login
    router.push('/');
  };

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navLinks.map((link) => (
        <Button
          key={link.label}
          asChild
          variant={pathname === link.href ? "secondary" : "ghost"}
          className="justify-start gap-3"
        >
          <Link href={link.href}>
            <link.icon size={20} />
            <span className="truncate">{link.label}</span>
          </Link>
        </Button>
      ))}
      <hr className="my-4 border-gray-700" />
      
      {/* Botón Cerrar Sesión con lógica funcional */}
      <Button
        variant="ghost"
        className="justify-start gap-3 text-red-500 hover:text-red-400 hover:bg-red-950/30"
        onClick={handleLogout}
      >
        <LogOut size={20} />
        <span className="truncate">Cerrar Sesión</span>
      </Button>
    </nav>
  );
}

// --- 3. Componente de Navegación (para reutilizar en móvil y desktop COLAPSADO) ---
function NavContentCollapsed() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('inventia_token');
    router.push('/');
  };

  return (
    <nav className="flex flex-col gap-2 p-4 items-center">
      {navLinks.map((link) => (
        <Button
          key={link.label}
          asChild
          variant={pathname === link.href ? "secondary" : "ghost"}
          size="icon"
          title={link.label}
        >
          <Link href={link.href}>
            <link.icon size={20} />
          </Link>
        </Button>
      ))}
      <hr className="my-4 border-gray-700 w-full" />
      
      {/* Botón Cerrar Sesión Colapsado */}
      <Button
        variant="ghost"
        size="icon"
        title="Cerrar Sesión"
        className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
        onClick={handleLogout}
      >
        <LogOut size={20} />
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  // Función de logout para el menú del header también
  const handleHeaderLogout = () => {
    localStorage.removeItem('inventia_token');
    router.push('/');
  };

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
        
        {isCollapsed ? <NavContentCollapsed /> : <NavContent />}

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

      {/* --- ÁREA DE CONTENIDO --- */}
      <div className={cn(
        "flex flex-col flex-1 w-full transition-all duration-300",
        isCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
          
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
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
          
          <div className="flex-1 flex items-center gap-2">
            <Image
              src="/hadros_logo.jpg"
              alt="Hadros Logo"
              width={35}
              height={35}
              className="rounded-full"
            />
            <span className="font-semibold text-lg hidden sm:inline-block">Hadros Uniformes</span>
          </div>

          {/* Menú de Usuario (Ahora funcional) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full border-2 border-gray-200">
                <User className="h-5 w-5" />
                <span className="sr-only">Menú usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleHeaderLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <main className="flex-1 p-4 md:p-8 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}