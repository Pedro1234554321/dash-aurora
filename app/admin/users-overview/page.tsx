'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import UsersOverviewTable from '@/components/UsersOverviewTable';

export default function UsersOverviewPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/info');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Não está autenticado, redirecionar para login
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-xl mr-3">
              <img 
                src="https://public-images-b573dd662d7c89a635d85c00405f50b1.s3.us-east-1.amazonaws.com/logos/IMG_6066.PNG"
                alt="Aurora Logo"
                className="w-16 h-16 object-contain shadow-lg rounded-2xl bg-white p-2"
              />
            </div>
            <div>
              <div className="font-bold text-teal-800 text-lg">AURORA</div>
              <div className="text-xs text-gray-500">INTELIGÊNCIA FINANCEIRA</div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-sm text-gray-600 hover:text-teal-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao Dashboard
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">Área Administrativa</h1>
          <p className="text-gray-600">Visão geral de todos os usuários da plataforma</p>
        </div>
        
        <div>
          <UsersOverviewTable />
        </div>
      </div>
    </div>
  );
}
