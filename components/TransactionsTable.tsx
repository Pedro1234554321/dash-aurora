'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DashboardDataType } from '../app/dashboard/types';
import { TransactionsFilter } from './transactions/TransactionsFilter';
import { TransactionRow } from './transactions/TransactionRow';
import { TransactionPagination } from './transactions/TransactionPagination';
import { TransactionViewModal } from './transactions/TransactionViewModal';
import { TransactionEditModal } from './transactions/TransactionEditModal';
import { TransactionLoadingState, TransactionEmptyState } from './transactions/TransactionLoadingStates';

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
  // Inicializa com a data atual no formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState(today);
  const [dateEndFilter, setDateEndFilter] = useState(today); // Data final do período
  const [transactionType, setTransactionType] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paginationData, setPaginationData] = useState({
    totalRecords: 0,
    totalPages: 0,
    limit: 10
  });
  
  // Estado para controlar o modal de ações
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'delete' | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
      
      // Adicionar filtro de tipo de transação
      if (transactionType !== 'all') {
        url += `&type=${transactionType}`;
      }
      
      // Adicionar filtro de intervalo de data se existir
      if (dateFilter) {
        // Formato esperado pela API: YYYY-MM-DD
        // Já está neste formato porque o input type="date" retorna assim
        url += `&dateStart=${encodeURIComponent(dateFilter)}`;
      }
      
      // Adicionar filtro de data final se existir
      if (dateEndFilter) {
        url += `&dateEnd=${encodeURIComponent(dateEndFilter)}`;
      }
      
      // Adicionar ordenação
      if (sortField) {
        url += `&sortField=${sortField}&sortDirection=${sortDirection}`;
      }
      
      console.log('Buscando transações com URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar transações');
      }
      
      const data = await response.json();
      
      // Atualizar estado local com as transações carregadas
      if (data.data && Array.isArray(data.data)) {
        setTransactions(data.data);
      }
      
      if (data.pagination) {
        setPaginationData({
          totalRecords: data.pagination.totalRecords,
          totalPages: data.pagination.totalPages,
          limit: data.pagination.limit
        });
      }
      
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
    setTransactionType('all');
    loadTransactions(1);
  };
  
  // Carregar transações quando o componente montar
  useEffect(() => {
    // Inicializar com as transações do dashboard quando disponíveis
    if (dashboardData?.transactions?.length) {
      setTransactions(dashboardData.transactions);
      setPaginationData(prev => ({
        ...prev,
        totalRecords: dashboardData.transactions.length,
        totalPages: Math.ceil(dashboardData.transactions.length / prev.limit)
      }));
    } else {
      // Carregar transações da API
      loadTransactions(1);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  
  // Handler para mudar o tipo de transação
  const handleTypeChange = (value: string) => {
    setTransactionType(value);
  };
  
  // Função para lidar com ações de visualização/edição/exclusão
  const handleAction = (transaction: Transaction, action: 'view' | 'edit' | 'delete') => {
    setSelectedTransaction(transaction);
    setActionType(action);
  };

  // Função para duplicar transação
  const handleDuplicate = (transaction: Transaction) => {
    const duplicatedTransaction = {
      ...transaction,
      id: `${transaction.id}-duplicated-${Date.now()}`, // Novo ID único
      description: `${transaction.description} (cópia)`
    };
    const updatedTransactions = [duplicatedTransaction, ...transactions];
    setTransactions(updatedTransactions);
  };
  
  // Função para salvar transação editada
  const handleSaveEdit = (updatedTransaction: Transaction) => {
    // Aqui implementaríamos a lógica para salvar as alterações
    alert('Funcionalidade ainda não implementada.');
    setActionType(null);
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
    <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Transações Recentes</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Gerencie suas entradas e saídas</p>
          </div>
          <Button 
            onClick={() => loadTransactions(currentPage)}
            variant="outline" 
            size="sm"
            className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 border-gray-200 hover:bg-teal-50 hover:text-teal-600 transition-colors"
          >
            {isLoading ? "Carregando..." : "Atualizar"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-5">
        {/* Componente de filtros */}
        <TransactionsFilter
          searchText={searchText}
          dateFilter={dateFilter}
          dateEndFilter={dateEndFilter}
          transactionType={transactionType}
          onSearchChange={handleSearchChange}
          onDateChange={handleDateChange}
          onDateEndChange={(e) => setDateEndFilter(e.target.value)}
          onTypeChange={handleTypeChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

        {/* Estados de carregamento e vazio */}
        {isLoading ? (
          <TransactionLoadingState />
        ) : transactions.length === 0 ? (
          <TransactionEmptyState />
        ) : (
          /* Tabela de transações */
          <div className="overflow-auto rounded-lg border border-gray-100 shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Descrição</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onViewDetails={(transaction) => handleAction(transaction, 'view')}
                    onEditTransaction={(transaction) => handleAction(transaction, 'edit')}
                    onDeleteTransaction={(transaction) => handleAction(transaction, 'delete')}
                    onDuplicateTransaction={handleDuplicate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      
      {/* Controles de paginação */}
      {!isLoading && transactions.length > 0 && (
        <CardFooter className="bg-gray-50 px-5 pt-5 pb-6 border-t">
          <TransactionPagination
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            totalRecords={paginationData.totalRecords}
            pageSize={paginationData.limit}
            isLoading={isLoading}
            onGoToFirstPage={() => setCurrentPage(1)}
            onGoToPreviousPage={goToPreviousPage}
            onGoToNextPage={goToNextPage}
            onGoToLastPage={() => setCurrentPage(paginationData.totalPages)}
          />
        </CardFooter>
      )}
      
      {/* Modais para visualização e edição */}
      <TransactionViewModal
        isOpen={actionType === 'view' && selectedTransaction !== null}
        transaction={selectedTransaction}
        onClose={() => setActionType(null)}
      />
      
      <TransactionEditModal
        isOpen={actionType === 'edit' && selectedTransaction !== null}
        transaction={selectedTransaction}
        onClose={() => setActionType(null)}
        onSave={handleSaveEdit}
      />
      
      {/* Modal de confirmação de exclusão */}
      <Dialog 
        open={actionType === 'delete' && selectedTransaction !== null} 
        onOpenChange={() => setActionType(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={() => setActionType(null)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => {
                // Aqui implementaríamos a lógica para excluir a transação
                if (selectedTransaction) {
                  const updatedTransactions = transactions.filter(t => t.id !== selectedTransaction.id);
                  setTransactions(updatedTransactions);
                  setActionType(null);
                }
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}