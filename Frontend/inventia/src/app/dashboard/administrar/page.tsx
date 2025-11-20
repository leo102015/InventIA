"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Pencil, Trash2, Loader2, User, Store, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- GESTIÓN DE USUARIOS ---
function UsuariosTab() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ id: "", nombre: "", email: "", password: "", rol: "operativo" });
    const [isEditing, setIsEditing] = useState(false);
    
    const fetchUsers = async () => {
        const res = await fetch("http://127.0.0.1:8000/usuarios/");
        setUsuarios(await res.json());
    };
    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async () => {
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `http://127.0.0.1:8000/usuarios/${formData.id}` : "http://127.0.0.1:8000/usuarios/";
        
        // Si estamos editando y el password está vacío, lo borramos del payload para no sobrescribirlo con vacío
        const payload: any = { ...formData };
        if (isEditing && !payload.password) delete payload.password;
        if (!isEditing) delete payload.id;

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        setDialogOpen(false);
        fetchUsers();
    };

    const handleDelete = async (id: number) => {
        if(!confirm("¿Eliminar usuario?")) return;
        await fetch(`http://127.0.0.1:8000/usuarios/${id}`, { method: "DELETE" });
        fetchUsers();
    };

    return (
        <div className="space-y-4">
            <Button onClick={() => { setIsEditing(false); setFormData({ id: "", nombre: "", email: "", password: "", rol: "operativo" }); setDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
            </Button>
            
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead>Rol</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {usuarios.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.nombre}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell className="capitalize">{u.rol}</TableCell>
                                    <TableCell className="text-right flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => { setIsEditing(true); setFormData({ ...u, password: "" }); setDialogOpen(true); }}>
                                            <Pencil className="h-4 w-4 text-blue-500"/>
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isEditing ? "Editar Usuario" : "Crear Usuario"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Nombre Completo" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        <Input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        <Input placeholder={isEditing ? "Nueva Contraseña (Dejar en blanco para mantener)" : "Contraseña"} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        <Select value={formData.rol} onValueChange={v => setFormData({...formData, rol: v})}>
                            <SelectTrigger><SelectValue placeholder="Rol" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="operativo">Operativo</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSubmit}>Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- GESTIÓN DE PROVEEDORES ---
function ProveedoresTab() {
    const [proveedores, setProveedores] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ id: "", nombre: "", contacto: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");

    const fetchProv = async () => {
        const res = await fetch("http://127.0.0.1:8000/productos/proveedores");
        setProveedores(await res.json());
    };
    useEffect(() => { fetchProv(); }, []);

    const handleSubmit = async () => {
        setError("");
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `http://127.0.0.1:8000/productos/proveedores/${formData.id}` : "http://127.0.0.1:8000/productos/proveedores";
        
        const payload: any = { ...formData };
        if (!isEditing) delete payload.id;

        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setDialogOpen(false);
        fetchProv();
    };

    const handleDelete = async (id: number) => {
        if(!confirm("¿Eliminar proveedor?")) return;
        const res = await fetch(`http://127.0.0.1:8000/productos/proveedores/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const err = await res.json();
            alert(err.detail);
        } else {
            fetchProv();
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={() => { setIsEditing(false); setFormData({ id: "", nombre: "", contacto: "" }); setDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Proveedor
            </Button>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Contacto</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {proveedores.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.id}</TableCell>
                                    <TableCell>{p.nombre}</TableCell>
                                    <TableCell>{p.contacto || "-"}</TableCell>
                                    <TableCell className="text-right flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => { setIsEditing(true); setFormData(p); setDialogOpen(true); }}><Pencil className="h-4 w-4 text-blue-500"/></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isEditing ? "Editar" : "Crear"} Proveedor</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Nombre Empresa" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        <Input placeholder="Contacto (Email/Teléfono)" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} />
                        <Button onClick={handleSubmit}>Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- GESTIÓN DE CANALES ---
function CanalesTab() {
    const [canales, setCanales] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ id: "", nombre: "" });
    const [isEditing, setIsEditing] = useState(false);

    const fetchCanales = async () => {
        const res = await fetch("http://127.0.0.1:8000/ventas/canales");
        setCanales(await res.json());
    };
    useEffect(() => { fetchCanales(); }, []);

    const handleSubmit = async () => {
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing ? `http://127.0.0.1:8000/ventas/canales/${formData.id}` : "http://127.0.0.1:8000/ventas/canales";
        
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: formData.nombre }) });
        setDialogOpen(false);
        fetchCanales();
    };

    const handleDelete = async (id: number) => {
        if(!confirm("¿Eliminar canal?")) return;
        const res = await fetch(`http://127.0.0.1:8000/ventas/canales/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const err = await res.json();
            alert(err.detail);
        } else {
            fetchCanales();
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={() => { setIsEditing(false); setFormData({ id: "", nombre: "" }); setDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Canal
            </Button>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre Canal</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {canales.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell>{c.id}</TableCell>
                                    <TableCell>{c.nombre}</TableCell>
                                    <TableCell className="text-right flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => { setIsEditing(true); setFormData(c); setDialogOpen(true); }}><Pencil className="h-4 w-4 text-blue-500"/></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{isEditing ? "Editar" : "Crear"} Canal</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input placeholder="Nombre del Canal (Ej. WhatsApp)" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                        <Button onClick={handleSubmit}>Guardar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- PÁGINA PRINCIPAL ---
export default function AdministrarPage() {
    return (
        <section>
            <h1 className="text-3xl font-bold mb-6">⚙️ Administración del Sistema</h1>
            
            <Tabs defaultValue="usuarios" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="usuarios"><User className="mr-2 h-4 w-4"/> Usuarios</TabsTrigger>
                    <TabsTrigger value="proveedores"><Store className="mr-2 h-4 w-4"/> Proveedores</TabsTrigger>
                    <TabsTrigger value="canales"><Globe className="mr-2 h-4 w-4"/> Canales Venta</TabsTrigger>
                </TabsList>

                <TabsContent value="usuarios" className="mt-6">
                    <UsuariosTab />
                </TabsContent>
                <TabsContent value="proveedores" className="mt-6">
                    <ProveedoresTab />
                </TabsContent>
                <TabsContent value="canales" className="mt-6">
                    <CanalesTab />
                </TabsContent>
            </Tabs>
        </section>
    );
}