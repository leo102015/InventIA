"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // Estado para mensajes de error
  const [isLoading, setIsLoading] = useState(false); // Estado para el botón de carga
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpia errores previos
    setIsLoading(true); // Muestra el estado de carga

    // FastAPI espera datos de formulario (x-www-form-urlencoded)
    // para el endpoint de OAuth2
    const formBody = new URLSearchParams();
    formBody.append('username', email); // FastAPI usa 'username' por defecto para el email
    formBody.append('password', password);

    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      if (!response.ok) {
        // Si la respuesta no es 2xx, es un error
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email o contraseña incorrectos');
      }

      // Si el login es exitoso
      const data: { access_token: string, token_type: string } = await response.json();
      
      console.log('Login exitoso, token:', data.access_token);
      
      // Aquí guardarías el token (en localStorage, cookies, o un state manager)
      // localStorage.setItem('token', data.access_token);

      // Redirige al dashboard
      router.push('/dashboard');

    } catch (err: any) {
      // Muestra el error al usuario
      setError(err.message || 'Error al intentar iniciar sesión. Intenta de nuevo.');
      setIsLoading(false);
    }
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
                disabled={isLoading}
              />
            </div>

            {/* Grupo de Contraseña con Toggle */}
            <div className="flex flex-col">
              <label htmlFor="password" className="mb-1 font-medium">Contraseña:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  className="border border-gray-300 p-2 rounded-md w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            
            {/* Botón de Submit */}
            <div>
              <button
                type="submit"
                className="w-full p-3 rounded-lg bg-[#0f2c47] text-white font-bold cursor-pointer hover:bg-[#1c4469] transition-colors disabled:opacity-50"
                disabled={isLoading} // Deshabilita el botón mientras carga
              >
                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

