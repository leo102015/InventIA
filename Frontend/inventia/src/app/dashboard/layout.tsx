"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  Hammer,
  Settings,
  Lock 
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
import { cn, parseJwt } from '@/lib/utils';

// Definición de links
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
  { href: "/dashboard/administrar", label: "Administrar", icon: Settings },
];

// --- Componente de Navegación Inteligente ---
function NavContent({ userRole }: { userRole: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('inventia_token');
    router.push('/');
  };

  return (
    <nav className="flex flex-col gap-1 p-2"> {/* Reduje gap y padding para compactar */}
      {navLinks.map((link) => {
        const isRestricted = userRole === 'operativo' && link.href !== '/dashboard/produccion';

        if (isRestricted) {
          return (
            <Button
              key={link.label}
              variant="ghost"
              className="justify-start gap-3 opacity-50 cursor-not-allowed bg-gray-800/20 text-gray-500 h-9" // h-9 para hacerlos un poco más compactos
              disabled 
            >
              <Lock size={18} className="text-gray-600"/>
              <span className="truncate line-through decoration-gray-600 text-sm">{link.label}</span>
            </Button>
          );
        }

        return (
          <Button
            key={link.label}
            asChild
            variant={pathname === link.href ? "secondary" : "ghost"}
            className="justify-start gap-3 h-9" // Altura compacta
          >
            <Link href={link.href}>
              <link.icon size={18} />
              <span className="truncate text-sm">{link.label}</span>
            </Link>
          </Button>
        );
      })}
      
      <hr className="my-2 border-gray-700" />
      <Button
        variant="ghost"
        className="justify-start gap-3 text-red-500 hover:text-red-400 hover:bg-red-950/30 h-9"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        <span className="truncate text-sm">Cerrar Sesión</span>
      </Button>
    </nav>
  );
}

// --- Navegación Colapsada Inteligente ---
function NavContentCollapsed({ userRole }: { userRole: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('inventia_token');
    router.push('/');
  };

  return (
    <nav className="flex flex-col gap-2 p-2 items-center">
      {navLinks.map((link) => {
        const isRestricted = userRole === 'operativo' && link.href !== '/dashboard/produccion';

        if (isRestricted) {
          return (
            <Button
              key={link.label}
              variant="ghost"
              size="icon"
              className="opacity-40 cursor-not-allowed"
              disabled
              title="Acceso Restringido"
            >
              <Lock size={18} />
            </Button>
          );
        }

        return (
          <Button
            key={link.label}
            asChild
            variant={pathname === link.href ? "secondary" : "ghost"}
            size="icon"
            title={link.label}
          >
            <Link href={link.href}>
              <link.icon size={18} />
            </Link>
          </Button>
        );
      })}
      <hr className="my-2 border-gray-700 w-full" />
      <Button
        variant="ghost"
        size="icon"
        title="Cerrar Sesión"
        className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
        onClick={handleLogout}
      >
        <LogOut size={18} />
      </Button>
    </nav>
  );
}

// --- LAYOUT PRINCIPAL ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('inventia_token');
    if (!token) { router.replace('/'); return; }

    const payload = parseJwt(token);
    if (!payload || !payload.rol) { localStorage.removeItem('inventia_token'); router.replace('/'); return; }

    const rol = payload.rol;
    setUserRole(rol);

    if (rol === 'operativo' && pathname !== '/dashboard/produccion') {
        router.replace('/dashboard/produccion');
        return; 
    }
    setIsAuthorized(true);
  }, [router, pathname]);

  const handleHeaderLogout = () => {
    localStorage.removeItem('inventia_token');
    router.push('/');
  };

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
            <Image src="/inventia_logo.jpg" alt="Loading" width={80} height={80} className="rounded-full animate-pulse" />
            <p className="text-gray-500 font-medium">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* SIDEBAR DESKTOP */}
      <aside className={cn(
        "hidden md:flex flex-col bg-gray-900 text-white fixed inset-y-0 left-0 z-10 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        {/* Header Fijo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700 shrink-0">
          <Image
            src="/inventia_logo.jpg"
            alt="InventIA Logo"
            width={isCollapsed ? 32 : 40}
            height={isCollapsed ? 32 : 40}
            className="rounded-full transition-all duration-300"
          />
          {!isCollapsed && <span className="ml-3 font-bold text-lg tracking-wider">InventIA</span>}
        </div>
        
        {/* Área Scrollable (Aquí está la magia para que no se corten los iconos) */}
        <div className="flex-1">
            {isCollapsed ? 
                <NavContentCollapsed userRole={userRole} /> : 
                <NavContent userRole={userRole} />
            }
        </div>

        {/* Footer Fijo */}
        <div className="p-4 border-t border-gray-700 shrink-0">
          <Button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            variant="ghost" 
            size="icon"
            className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </Button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className={cn(
        "flex flex-col flex-1 w-full transition-all duration-300",
        isCollapsed ? "md:pl-20" : "md:pl-64"
      )}>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-gray-900 text-white border-0">
              <div className="flex items-center justify-center h-16 border-b border-gray-700">
                <Image src="/inventia_logo.jpg" alt="InventIA Logo" width={40} height={40} className="rounded-full" />
                <span className="ml-3 font-bold text-lg">InventIA</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                 <NavContent userRole={userRole} />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 flex items-center gap-2">
            <Image src="/hadros_logo.jpg" alt="Hadros Logo" width={35} height={35} className="rounded-full" />
            <span className="font-semibold text-lg hidden sm:inline-block">Hadros Uniformes</span>
            {userRole === 'operativo' && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-300">
                    MODO OPERATIVO
                </span>
            )}
            {userRole === 'admin' && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-300">
                    ADMINISTRADOR
                </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full border-2 border-gray-200">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta ({userRole})</DropdownMenuLabel>
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