'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionsTableProps {
  filters: any;
}

const mockTransactions = [
  {
    id: '001',
    date: '2024-01-15',
    description: 'Venda de Software - Cliente ABC',
    category: 'Receita',
    type: 'Entrada',
    amount: 45000,
    status: 'Confirmado'
  },
  {
    id: '002',
    date: '2024-01-14',
    description: 'Pagamento Fornecedor XYZ',
    category: 'Operacional',
    type: 'Saída',
    amount: -12500,
    status: 'Processado'
  },
  {
    id: '003',
    date: '2024-01-13',
    description: 'Investimento em Marketing Digital',
    category: 'Marketing',
    type: 'Saída',
    amount: -8500,
    status: 'Pendente'
  },
  {
    id: '004',
    date: '2024-01-12',
    description: 'Consultoria Financeira',
    category: 'Receita',
    type: 'Entrada',
    amount: 25000,
    status: 'Confirmado'
  },
  {
    id: '005',
    date: '2024-01-11',
    description: 'Salários Equipe',
    category: 'Pessoal',
    type: 'Saída',
    amount: -95000,
    status: 'Processado'
  }
];

export default function TransactionsTable({ filters }: TransactionsTableProps) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Processado':
        return 'bg-blue-100 text-blue-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Transações Recentes</CardTitle>
          <Button variant="outline" size="sm">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('date')}
                  >
                    Data
                    <ArrowUpDown className="ml-2 w-3 h-3" />
                  </Button>
                </th>
                <th className="text-left p-4 font-medium text-gray-700">Descrição</th>
                <th className="text-left p-4 font-medium text-gray-700">Categoria</th>
                <th className="text-left p-4 font-medium text-gray-700">Tipo</th>
                <th className="text-left p-4 font-medium text-gray-700">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 font-medium"
                    onClick={() => handleSort('amount')}
                  >
                    Valor
                    <ArrowUpDown className="ml-2 w-3 h-3" />
                  </Button>
                </th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-center p-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((transaction, index) => (
                <tr key={transaction.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                    <div className="text-xs text-gray-500">ID: {transaction.id}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{transaction.category}</td>
                  <td className="p-4">
                    <Badge 
                      variant="secondary" 
                      className={transaction.type === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {transaction.type}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}