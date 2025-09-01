'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: string;
  amount: number;
  status?: string;
}

interface TransactionViewModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

// Função auxiliar para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Math.abs(value));
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

export function TransactionViewModal({ isOpen, transaction, onClose }: TransactionViewModalProps) {
  if (!transaction) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Detalhes da Transação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="flex justify-between items-center pb-3 border-b">
            <div>
              <p className="text-sm font-semibold text-gray-500">Valor</p>
              <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
            </div>
            <Badge 
              className={
                transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                transaction.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-800'
              }
            >
              {translateStatus(transaction.status)}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">Data</p>
              <p className="text-gray-800">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Tipo</p>
              <p className="text-gray-800">{translateType(transaction.type)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-gray-500">Descrição</p>
            <p className="text-gray-800">{transaction.description}</p>
          </div>
          
          <div>
            <p className="text-sm font-semibold text-gray-500">Categoria</p>
            <Badge variant="outline" className="mt-1">{transaction.category}</Badge>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onClose} 
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
