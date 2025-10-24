"use client"; // <--- Añade esto para poder usar 'useState'

import { useState } from 'react'; // <--- Importa useState
import { useRouter } from 'next/navigation'; // <-- 1. Import useRouter

export default function Home() {
  // --- PASO 2: Añadir estado para manejar los inputs ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // <-- Initialize the router

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Simulating login with:');
    console.log('Email:', email);
    console.log('Password:', password);

    // --- 2. Navigate to the dashboard ---
    // In the future, you'll only do this AFTER
    // successfully verifying credentials with your FastAPI backend.
    router.push('/dashboard');
    // --- End of navigation ---
  };

  return (
    // Usamos flexbox para centrar todo en la pantalla
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0f2c47] to-gray-400">
      <div className="bg-white p-12 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center font-bold text-3xl mb-8">
          <h1>Bienvenido a InventIA</h1>
        </div>

        <div>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            
            {/* Un div para el grupo de email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 font-medium">Email:</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                className="border border-gray-300 p-2 rounded-md" // Estilos de input
                value={email} // Controla el valor con el estado
                onChange={(e) => setEmail(e.target.value)} // Actualiza el estado
              />
            </div>

            {/* Un div para el grupo de contraseña */}
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-1 font-medium">Contraseña:</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                className="border border-gray-300 p-2 rounded-md"
                value={password} // Controla el valor con el estado
                onChange={(e) => setPassword(e.target.value)} // Actualiza el estado
              />
            </div>
            
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