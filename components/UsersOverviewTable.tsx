'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronDown, User, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface UserOverviewItem {
  id: string;
  nome: string;
  email: string;
  totalEntradas: number;
  totalDespesas: number;
  saldo: number;
}

export default function UsersOverviewTable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserOverviewItem[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // Estatísticas gerais
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEntradas: 0,
    totalDespesas: 0,
    saldoTotal: 0
  });

  // Carregar dados dos usuários
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dashboard/user-overview');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar dados: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setUsers(data.data);
        
        // Calcular estatísticas
        const totalEntradas = data.data.reduce((sum: number, user: UserOverviewItem) => sum + user.totalEntradas, 0);
        const totalDespesas = data.data.reduce((sum: number, user: UserOverviewItem) => sum + user.totalDespesas, 0);
        
        setStats({
          totalUsers: data.data.length,
          totalEntradas,
          totalDespesas,
          saldoTotal: totalEntradas - totalDespesas
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos usuários:', error);
      setError('Não foi possível carregar os dados dos usuários. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Filtrar usuários com base no texto de busca
  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Visão Geral dos Usuários</h2>
          <p className="text-gray-600 text-sm">
            {stats.totalUsers} usuários registrados com saldo total de {formatCurrency(stats.saldoTotal)}
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar usuário..."
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Usuários</p>
              <p className="text-xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Entradas</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(stats.totalEntradas)}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Despesas</p>
              <p className="text-xl font-bold text-rose-600">{formatCurrency(stats.totalDespesas)}</p>
            </div>
            <div className="p-2 bg-rose-100 rounded-full">
              <DollarSign className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Saldo Total</p>
              <p className={`text-xl font-bold ${stats.saldoTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(stats.saldoTotal)}
              </p>
            </div>
            <div className={`p-2 rounded-full ${stats.saldoTotal >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-5 w-5 ${stats.saldoTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white shadow-sm rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-teal-500 rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados dos usuários...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 text-lg mb-2">Erro ao carregar dados</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={loadUsers}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Nome</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Entradas</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Despesas</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Saldo</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                            {user.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.nome}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600">
                        {formatCurrency(user.totalEntradas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-rose-600">
                        {formatCurrency(user.totalDespesas)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${user.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(user.saldo)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
