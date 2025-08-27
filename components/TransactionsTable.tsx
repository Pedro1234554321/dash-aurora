'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, ArrowUpDown, Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DashboardDataType } from '../app/dashboard/types';

interface TransactionsTableProps {
  dashboardData: DashboardDataType;
}

// Tipo para as transações
interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  amount: number;
  status?: string; // Tornando o status opcional
}

export default function TransactionsTable({ dashboardData }: TransactionsTableProps) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [paginationData, setPaginationData] = useState({
    totalRecords: 0,
    totalPages: 0,
    limit: 20
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'processed':
      case 'processado':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Traduz os status para português
  const translateStatus = (status?: string) => {
    if (!status) return 'Desconhecido';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'processed':
        return 'Processado';
      default:
        return status;
    }
  };
  
  // Traduz os tipos de transação para português
  const translateType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'income':
        return 'Entrada';
      case 'expense':
        return 'Saída';
      default:
        return type;
    }
  };
  
  // Função para carregar transações com paginação e filtros
  const loadTransactions = async (page: number) => {
    try {
      setIsLoading(true);
      
      // Construir URL com parâmetros de filtro
      let url = `/api/dashboard/transactions?page=${page}&limit=${paginationData.limit}`;
      
      // Adicionar filtro de busca se existir
      if (searchText.trim()) {
        url += `&search=${encodeURIComponent(searchText.trim())}`;
      }
      
      // Adicionar filtro de data se existir
      if (dateFilter) {
        url += `&date=${encodeURIComponent(dateFilter)}`;
      }
      
      console.log('Buscando transações com URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar transações');
      }
      
      const data = await response.json();
      
      if (data.pagination) {
        setPaginationData({
          totalRecords: data.pagination.totalRecords,
          totalPages: data.pagination.totalPages,
          limit: data.pagination.limit
        });
      }
      
      // Atualizar o estado do dashboard com as novas transações
      dashboardData.transactions = data.data;
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funções para navegação de páginas
  const goToNextPage = () => {
    if (currentPage < paginationData.totalPages) {
      loadTransactions(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      loadTransactions(currentPage - 1);
    }
  };
  
  // Handler para atualizar o filtro de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handler para atualizar o filtro de data
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  // Handler para aplicar os filtros
  const applyFilters = () => {
    loadTransactions(1); // Reinicia a paginação ao aplicar filtros
  };

  // Handler para limpar os filtros
  const clearFilters = () => {
    setSearchText('');
    setDateFilter('');
    loadTransactions(1);
  };

  // Inicializar paginação quando os dados do dashboard forem carregados
  useEffect(() => {
    if (dashboardData.transactions && dashboardData.transactions.length > 0) {
      // Inicializa os dados de paginação com base nos dados iniciais recebidos
      if (dashboardData.pagination) {
        setPaginationData({
          totalRecords: dashboardData.pagination.totalRecords,
          totalPages: dashboardData.pagination.totalPages,
          limit: dashboardData.pagination.limit
        });
      }
    }
  }, [dashboardData]);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-lg font-semibold text-gray-900">Transações Recentes</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadTransactions(1)}
            disabled={isLoading}
            className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
          >
            {isLoading ? "Carregando..." : "Recarregar"}
          </Button>
        </div>
      </CardHeader>
      
      {/* Filtros de pesquisa e data */}
      <div className="px-3 sm:px-5 pb-2 pt-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
            <Input
              placeholder="Buscar..."
              className="pl-7 sm:pl-10 py-1 sm:py-2 text-xs sm:text-sm h-8 sm:h-10"
              value={searchText}
              onChange={handleSearchChange}
            />
          </div>
          <div className="relative sm:w-48">
            <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
            <Input
              type="date"
              className="pl-7 sm:pl-10 py-1 sm:py-2 text-xs sm:text-sm h-8 sm:h-10"
              value={dateFilter}
              onChange={handleDateChange}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={applyFilters}
              className="h-8 sm:h-10 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
            >
              Filtrar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="h-8 sm:h-10 text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2"
            >
              Limpar
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 sm:p-4 font-medium text-gray-700">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 font-medium text-xs sm:text-sm"
                    onClick={() => handleSort('date')}
                  >
                    Data
                    <ArrowUpDown className="ml-1 sm:ml-2 w-3 h-3" />
                  </Button>
                </th>
                <th className="text-left p-2 sm:p-4 font-medium text-gray-700 hidden sm:table-cell">Descrição</th>
                <th className="text-left p-2 sm:p-4 font-medium text-gray-700 hidden md:table-cell">Categoria</th>
                <th className="text-left p-2 sm:p-4 font-medium text-gray-700">Tipo</th>
                <th className="text-left p-2 sm:p-4 font-medium text-gray-700">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 font-medium text-xs sm:text-sm"
                    onClick={() => handleSort('amount')}
                  >
                    Valor
                    <ArrowUpDown className="ml-1 sm:ml-2 w-3 h-3" />
                  </Button>
                </th>
                <th className="text-left p-2 sm:p-4 font-medium text-gray-700 hidden sm:table-cell">Status</th>
                <th className="text-center p-2 sm:p-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.transactions && dashboardData.transactions.length > 0 ? (
                // Limita para exibir apenas as 5 transações mais recentes
                dashboardData.transactions.slice(0, 5).map((transaction: Transaction, index: number) => (
                <tr key={transaction.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-2 sm:p-4 text-xs sm:text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-2 sm:p-4 hidden sm:table-cell">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">{transaction.description}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">ID: {transaction.id.substring(0, 8)}</div>
                  </td>
                  <td className="p-2 sm:p-4 text-xs sm:text-sm text-gray-700 hidden md:table-cell">{transaction.category}</td>
                  <td className="p-2 sm:p-4">
                    <Badge 
                      variant="secondary" 
                      className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 ${transaction.type.toLowerCase() === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {translateType(transaction.type)}
                    </Badge>
                  </td>
                  <td className="p-2 sm:p-4">
                    <span className={`text-xs sm:text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="p-2 sm:p-4 hidden sm:table-cell">
                    <Badge className={`text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 ${getStatusColor(transaction.status)}`}>
                      {translateStatus(transaction.status)}
                    </Badge>
                  </td>
                  <td className="p-2 sm:p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                          <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    Nenhuma transação disponível. Os dados serão exibidos quando estiverem disponíveis no banco de dados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Controles de paginação */}
        {dashboardData.transactions && dashboardData.transactions.length > 0 && (
          <div className="flex justify-between items-center mt-4 px-4 pb-2">
            <div className="text-sm text-gray-500">
              {isLoading ? (
                "Carregando..."
              ) : (
                `Mostrando ${Math.min(paginationData.limit, dashboardData.transactions.length)} de ${paginationData.totalRecords} transações`
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1 || isLoading}
              >
                Anterior
              </Button>
              <span className="flex items-center justify-center px-3 py-1 text-sm bg-gray-100 rounded">
                {currentPage} / {Math.max(1, paginationData.totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= paginationData.totalPages || isLoading}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}