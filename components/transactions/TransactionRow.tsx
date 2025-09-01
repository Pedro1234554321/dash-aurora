'use client';

import { MoreHorizontal, Eye, Edit, Copy, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  amount: number;
  status?: string;
}

interface TransactionRowProps {
  transaction: Transaction;
  onViewDetails: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
  onDuplicateTransaction: (transaction: Transaction) => void;
}

// Função auxiliar para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Math.abs(value));
};

// Função para traduzir status
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

export function TransactionRow({
  transaction,
  onViewDetails,
  onEditTransaction,
  onDeleteTransaction,
  onDuplicateTransaction
}: TransactionRowProps) {
  return (
    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3.5 text-sm text-gray-600">
        {new Date(transaction.date).toLocaleDateString('pt-BR')}
      </td>
      <td className="px-4 py-3.5 text-sm">
        <div className="font-medium text-gray-900 truncate max-w-[180px]">{transaction.description}</div>
      </td>
      <td className="px-4 py-3.5 text-sm">
        <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700 font-medium">
          {transaction.category}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-sm text-right font-medium">
        <span className={transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>
      </td>
      <td className="px-4 py-3.5 text-xs text-center">
        <Badge 
          className={
            transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0' :
            transaction.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-0' :
            'bg-gray-100 text-gray-800 hover:bg-gray-100 border-0'
          }
        >
          {translateStatus(transaction.status)}
        </Badge>
      </td>
      <td className="px-4 py-3.5 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border border-gray-100 shadow-lg">
            <DropdownMenuItem 
              onClick={() => onViewDetails(transaction)} 
              className="cursor-pointer hover:bg-gray-50 hover:text-gray-900"
            >
              <Eye className="mr-2 h-4 w-4 text-gray-500" />
              <span>Ver Detalhes</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onEditTransaction(transaction)} 
              className="cursor-pointer hover:bg-gray-50 hover:text-gray-900"
            >
              <Edit className="mr-2 h-4 w-4 text-blue-500" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDuplicateTransaction(transaction)} 
              className="cursor-pointer hover:bg-gray-50 hover:text-gray-900"
            >
              <Copy className="mr-2 h-4 w-4 text-teal-500" />
              <span>Duplicar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem 
              onClick={() => onDeleteTransaction(transaction)} 
              className="text-red-600 focus:text-red-600 cursor-pointer hover:bg-red-50"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
