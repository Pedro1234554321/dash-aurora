'use client';

import { Search, Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TransactionsFilterProps {
  searchText: string;
  dateFilter: string;
  dateEndFilter: string; // Nova propriedade para data final
  transactionType: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateEndChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Nova função para data final
  onTypeChange: (value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function TransactionsFilter({
  searchText,
  dateFilter,
  dateEndFilter,
  transactionType,
  onSearchChange,
  onDateChange,
  onDateEndChange,
  onTypeChange,
  onApplyFilters,
  onClearFilters
}: TransactionsFilterProps) {
  const hasActiveFilters = searchText || dateFilter !== '' || transactionType !== 'all';

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
        <div className="relative flex-grow">
          <Label htmlFor="search-transactions" className="text-sm font-medium mb-1.5 block text-gray-700">
            Buscar
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              id="search-transactions"
              placeholder="Buscar transações..." 
              className="pl-9 py-2 bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
              value={searchText}
              onChange={onSearchChange}
            />
          </div>
        </div>
        
        <div className="w-full sm:w-48">
          <Label htmlFor="transaction-type" className="text-sm font-medium mb-1.5 block text-gray-700">
            Tipo
          </Label>
          <Select 
            value={transactionType} 
            onValueChange={onTypeChange}
          >
            <SelectTrigger id="transaction-type" className="bg-gray-50 border-gray-200 focus:bg-white transition-colors">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Apenas Entradas</SelectItem>
              <SelectItem value="expense">Apenas Saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-40">
            <Label htmlFor="date-filter-start" className="text-sm font-medium mb-1.5 block text-gray-700">
              De
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="date-filter-start"
                type="date"
                className="pl-9 py-2 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                value={dateFilter}
                onChange={onDateChange}
              />
            </div>
          </div>
          
          <div className="w-full sm:w-40">
            <Label htmlFor="date-filter-end" className="text-sm font-medium mb-1.5 block text-gray-700">
              Até
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="date-filter-end"
                type="date"
                className="pl-9 py-2 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                value={dateEndFilter}
                onChange={onDateEndChange}
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            variant="default" 
            size="sm" 
            onClick={onApplyFilters}
            className="w-full sm:w-auto py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-colors"
          >
            <Filter className="mr-2 h-4 w-4" />
            Aplicar Filtros
          </Button>
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="w-full sm:w-auto py-2"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
