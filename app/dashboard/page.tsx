'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardCards from '@/components/DashboardCards';
import ChartsSection from '@/components/ChartsSection';
import TransactionsTable from '@/components/TransactionsTable';
import FilterPanel from '@/components/FilterPanel';
import UserInfoCard from '@/components/UserInfoCard';
import { Loader2, AlertCircle, LogOut } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DashboardDataType } from './types'; // Importando a interface atualizada

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estado para os dados do dashboard
  const [dashboardData, setDashboardData] = useState<DashboardDataType>({
    summary: null,
    transactions: [],
    spendingPatterns: [],
    recurringTransactions: [],
    categorySpending: [],
    monthlyComparison: []
  });
  
  // Estado para armazenar informações do usuário
  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    totalEntradas?: number;
    totalDespesas?: number;
    saldo?: number;
  } | null>(null);
  
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros para o dashboard
  const [filters, setFilters] = useState({
    period: '30d',
    category: 'all',
    type: 'all',
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });
  
  // Função para realizar logout
  const handleLogout = () => {
    console.log('Realizando logout...');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authTimestamp');
    localStorage.removeItem('user_email');
    localStorage.removeItem('userId');
    localStorage.removeItem('auth-token');
    
    // Redirecionar para a página de login
    router.push('/login');
  };
  
  useEffect(() => {
    // Verificar status de autenticação 
    const checkAuth = async () => {
      try {
        console.log('Iniciando verificação de autenticação no dashboard...');
        
        // PRIMEIRA VERIFICAÇÃO: TOKEN NO LOCALSTORAGE (solução alternativa)
        const storedToken = localStorage.getItem('auth-token');
        if (storedToken) {
          console.log('Token encontrado no localStorage');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        // SEGUNDA VERIFICAÇÃO: LOCALSTORAGE FLAGS
        const localStorageAuth = localStorage.getItem('isAuthenticated');
        const timestamp = localStorage.getItem('authTimestamp');
        const userId = localStorage.getItem('userId');
        const isRecent = timestamp && (Date.now() - parseInt(timestamp)) < (24 * 60 * 60 * 1000); // 24 horas
        
        if (localStorageAuth === 'true' && isRecent && userId) {
          console.log('Autenticação válida via localStorage para usuário:', userId);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        // TERCEIRA VERIFICAÇÃO: COOKIES
        const cookies = document.cookie.split(';').map(c => c.trim());
        const authStatusCookie = cookies.find(c => c.startsWith('auth-status='));
        
        if (authStatusCookie) {
          console.log('Cookie auth-status encontrado');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        // QUARTA VERIFICAÇÃO: CHAMADA AO SERVIDOR COMO ÚLTIMO RECURSO
        console.log('Tentando verificação via API...');
        const res = await fetch('/api/dashboard/monthly-summary?months=1');
          
        if (res.ok) {
          console.log('API confirmou autenticação válida');
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('authTimestamp', Date.now().toString());
        } else {
          // Se API retornar não autorizado, tentar uma última verificação do localStorage
          console.log('Falha na verificação da API. Última tentativa com localStorage...');
          
          // Se todas as verificações falharem, redirecionar para login
          console.log('Usuário não autenticado ou sessão expirada');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('authTimestamp');
          localStorage.removeItem('user_email');
          localStorage.removeItem('userId');
          localStorage.removeItem('auth-token');
          
          // Forçar logout e redirecionamento
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Função para carregar os dados do usuário
  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('Carregando informações do usuário...');
      const [userBasicResponse, userFinancialResponse] = await Promise.all([
        fetch('/api/user/info'),
        fetch('/api/dashboard/user-summary')
      ]);
      
      if (!userBasicResponse.ok) {
        console.error('Erro ao buscar informações básicas do usuário');
        return;
      }
      
      const basicData = await userBasicResponse.json();
      console.log('Dados básicos do usuário:', basicData);
      
      let financialData: { data?: { totalEntradas?: number; totalDespesas?: number; saldo?: number } } = {};
      
      if (userFinancialResponse.ok) {
        financialData = await userFinancialResponse.json();
        console.log('Dados financeiros do usuário:', financialData);
      } else {
        console.error('Erro ao buscar resumo financeiro do usuário');
      }
      
      if (basicData.success && basicData.user) {
        // Combinar dados básicos com dados financeiros
        setUserData({
          ...basicData.user,
          // Adicionar dados financeiros se disponíveis
          totalEntradas: financialData.data?.totalEntradas || 0,
          totalDespesas: financialData.data?.totalDespesas || 0,
          saldo: financialData.data?.saldo || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }, [isAuthenticated]);
  
  // Função para carregar os dados do dashboard
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setDataLoading(true);
    setError(null);
    console.log('Carregando dados do dashboard...');
    
    // Definir um timeout para evitar que a requisição fique pendente indefinidamente
    const timeout = (ms: number) => {
      return new Promise((_, reject) => setTimeout(() => reject(new Error('Tempo esgotado')), ms));
    };
    
    try {
      // Determinar o intervalo de meses com base no filtro selecionado
      const monthsParam = filters.period === '30d' ? 1 : 
                         filters.period === '90d' ? 3 : 
                         filters.period === '180d' ? 6 : 12;
      
      console.log(`Buscando dados para ${monthsParam} meses`);
      
      // 1. Carregando resumo financeiro mensal
      const financialSummaryPromise = await Promise.race([
        fetch(`/api/dashboard/monthly-summary?months=${monthsParam}`),
        timeout(15000)
      ]) as Response;
      
      if (!financialSummaryPromise.ok) {
        throw new Error(`Erro ao carregar resumo financeiro: ${financialSummaryPromise.status}`);
      }
      
      const financialSummary = await financialSummaryPromise.json();
      console.log('Resumo financeiro carregado:', financialSummary);
      
      // 2. Carregando informações do usuário
      const userPromise = await Promise.race([
        fetch('/api/user/info'),
        timeout(8000)
      ]) as Response;
      
      if (userPromise.ok) {
        const userResult = await userPromise.json();
        console.log('Dados do usuário carregados:', userResult);
        if (userResult.data) {
          setUserData(userResult.data);
        }
      } else {
        console.error('Não foi possível carregar dados do usuário');
      }
      
      // 3. Carregando padrão de gastos por período
      const spendingPatternPromise = await Promise.race([
        fetch('/api/dashboard/spending-pattern'),
        timeout(10000)
      ]) as Response;
      
      if (!spendingPatternPromise.ok) {
        console.error(`Erro ao carregar padrões de gastos: ${spendingPatternPromise.status}`);
      } else {
        const spendingPatternData = await spendingPatternPromise.json();
        console.log('Padrões de gastos carregados:', spendingPatternData);
        
        // Atualizar os dados no estado
        setDashboardData(prev => ({
          ...prev,
          spendingPatterns: spendingPatternData.data || []
        }));
      }
      
      // Carregar resumo mensal para o gráfico de comparação
      const summaryResponse = await fetch(`/api/dashboard/monthly-summary?months=${monthsParam}`);
      if (!summaryResponse.ok) {
        console.error('Erro na resposta do summary:', await summaryResponse.text());
        throw new Error('Falha ao carregar resumo mensal');
      }
      const summaryData = await summaryResponse.json();
      console.log('Dados de resumo mensal:', summaryData);
      
      console.log('Fazendo requisição para spending-patterns');
      // Carregar padrões de gastos
      const patternsResponse = await fetch('/api/dashboard/spending-patterns');
      if (!patternsResponse.ok) {
        console.error('Erro na resposta de patterns:', await patternsResponse.text());
        throw new Error('Falha ao carregar padrões de gasto');
      }
      const patternsData = await patternsResponse.json();
      console.log('Dados de padrões de gasto:', patternsData);
      
      console.log('Fazendo requisição para recurring-transactions');
      // Carregar transações recorrentes
      const recurringResponse = await fetch('/api/dashboard/recurring-transactions');
      if (!recurringResponse.ok) {
        console.error('Erro na resposta de recurring:', await recurringResponse.text());
        throw new Error('Falha ao carregar transações recorrentes');
      }
      const recurringData = await recurringResponse.json();
      console.log('Dados de transações recorrentes:', recurringData);
      
      // Carregar gastos por categoria
      console.log('Fazendo requisição para category-spending');
      const categoryResponse = await fetch('/api/dashboard/category-spending');
      if (!categoryResponse.ok) {
        console.error('Erro na resposta de category:', await categoryResponse.text());
        throw new Error('Falha ao carregar gastos por categoria');
      }
      const categoryData = await categoryResponse.json();
      console.log('Dados de gastos por categoria:', categoryData);
      
      // Buscar transações recentes
      console.log('Fazendo requisição para transactions');
      const transactionsResponse = await fetch('/api/dashboard/transactions');
      if (!transactionsResponse.ok) {
        console.error('Erro na resposta de transações:', await transactionsResponse.text());
        throw new Error('Falha ao carregar transações');
      }
      const transactionsData = await transactionsResponse.json();
      console.log('Dados de transações:', transactionsData);
      
      // Atualizar o estado com todos os dados
      setDashboardData({
        summary: financialSummary, // Usando o resumo financeiro para o gráfico de pizza
        transactions: transactionsData.data || [], // Dados reais de transações
        spendingPatterns: patternsData.data || [],
        recurringTransactions: recurringData.data || [],
        categorySpending: categoryData.data || [],
        monthlyComparison: summaryData // Usar os dados de resumo mensal para o gráfico de comparação
      });
      
      console.log('Dashboard data loaded successfully!');
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Ocorreu um erro ao carregar os dados. Por favor, tente novamente.');
    } finally {
      setDataLoading(false);
    }
  }, [filters, isAuthenticated]);
  
  // Carregar dados do usuário quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, loadUserData]);
  
  // Carregar dados do dashboard quando autenticado ou quando os filtros mudarem
  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated, filters, loadDashboardData]);

  // Exibir um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
  // Se não estiver autenticado e não estiver carregando, mostrar mensagem de erro
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">&#10060;</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não está autenticado ou sua sessão expirou.</p>
          <button 
            onClick={() => router.push('/login')} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }
  
  // Exibir indicador de carregamento enquanto busca dados (após login)
  if (isAuthenticated && dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Carregando seus dados financeiros...</p>
        </div>
      </div>
    );
  }
  
  // Exibir mensagem de erro caso ocorra algum problema no carregamento dos dados
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadDashboardData} 
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
  
  // Se autenticado, exibir o dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-xl mr-3">
              <img 
                src="https://public-images-b573dd662d7c89a635d85c00405f50b1.s3.us-east-1.amazonaws.com/logos/IMG_6066.PNG"
                alt="Aurora Logo"
                className=""
              />
            </div>
            <div>
              <div className="font-bold text-teal-800 text-lg">AURORA</div>
              <div className="text-xs text-gray-500">INTELIGÊNCIA FINANCEIRA</div>
            </div>
          </div>
          
          {/* Botão de sair */}
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
        
        {/* Card com informações do usuário e resumo financeiro */}
        {userData && (
          <UserInfoCard 
            id={userData.id} 
            name={userData.name} 
            email={userData.email} 
            phone={userData.phone}
            totalEntradas={userData.totalEntradas}
            totalDespesas={userData.totalDespesas}
            saldo={userData.saldo}
          />
        )}
        
        <main>
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
              <p className="text-gray-600 mt-1">Visão geral da sua inteligência financeira</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select 
                value={filters.period} 
                onChange={(e) => setFilters({...filters, period: e.target.value})}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="30d">30 dias</option>
                <option value="90d">90 dias</option>
                <option value="180d">6 meses</option>
                <option value="365d">12 meses</option>
              </select>
              
              <button 
                onClick={loadDashboardData}
                className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4" /> Atualizar dados
              </button>
              
              {/* Botão de visão geral de usuários removido */}
            </div>
          </div>
          
          <DashboardCards dashboardData={dashboardData} />
          
          <div className="mt-8">
            <ChartsSection filters={filters} dashboardData={dashboardData} />
          </div>
          
          <div className="mt-8">
            <TransactionsTable dashboardData={dashboardData} />
          </div>
        </main>
      </div>
    </div>
  );
}