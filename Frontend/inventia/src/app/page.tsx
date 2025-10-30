"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react'; // Importamos los iconos

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el toggle
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Simulating login with:');
    console.log('Email:', email);
    console.log('Password:', password);
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f2c47] p-4">
      <div className="bg-white p-8 sm:p-12 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center font-bold text-3xl mb-8">
          <h1>Bienvenido a InventIA</h1>
        </div>
        <div>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            
            {/* Grupo de Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 font-medium">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="border border-gray-300 p-2 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Grupo de Contraseña con Toggle */}
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-1 font-medium">Contraseña:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} // Tipo dinámico
                  id="password"
                  name="password"
                  required
                  className="border border-gray-300 p-2 rounded-md w-full pr-10" // Padding a la derecha
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button" // Previene que el form se envíe
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)} // Cambia el estado
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* Botón de Submit */}
            <div>
              <button
                type="submit"
                className="w-full p-3 rounded-lg bg-[#0f2c47] text-white font-bold cursor-pointer hover:bg-[#1c4469] transition-colors">
                Iniciar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
