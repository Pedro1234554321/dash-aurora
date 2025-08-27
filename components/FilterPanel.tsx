'use client';

import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface FilterPanelProps {
  filters: {
    period: string;
    category: string;
    type: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  onFiltersChange: (filters: any) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <Select value={filters.period} onValueChange={(value) => updateFilter('period', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="receitas">Receitas</SelectItem>
              <SelectItem value="despesas">Despesas</SelectItem>
              <SelectItem value="investimentos">Investimentos</SelectItem>
              <SelectItem value="impostos">Impostos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
              <SelectItem value="transferencia">Transferências</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 ml-auto">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Data personalizada
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-[#00E980] to-[#00FFBB] hover:from-[#00E980]/90 hover:to-[#00FFBB]/90 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}