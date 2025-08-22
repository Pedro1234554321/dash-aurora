'use client';

import { TrendingUp, TrendingDown, DollarSign, Target, PieChart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCardsProps {
  filters: any;
}

const mockData = {
  revenue: { value: 2847650, change: 12.5, trend: 'up' },
  expenses: { value: 1934200, change: -8.2, trend: 'down' },
  profit: { value: 913450, change: 18.7, trend: 'up' },
  margin: { value: 32.1, change: 4.3, trend: 'up' },
  investments: { value: 1250000, change: 15.8, trend: 'up' },
  cash: { value: 678900, change: -2.1, trend: 'down' }
};

export default function DashboardCards({ filters }: DashboardCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Receita Total',
      value: formatCurrency(mockData.revenue.value),
      change: mockData.revenue.change,
      trend: mockData.revenue.trend,
      icon: DollarSign,
      color: 'from-[#00E980] to-[#00FFBB]'
    },
    {
      title: 'Despesas',
      value: formatCurrency(mockData.expenses.value),
      change: mockData.expenses.change,
      trend: mockData.expenses.trend,
      icon: TrendingDown,
      color: 'from-[#007A7F] to-[#015061]'
    },
    {
      title: 'Lucro Líquido',
      value: formatCurrency(mockData.profit.value),
      change: mockData.profit.change,
      trend: mockData.profit.trend,
      icon: Target,
      color: 'from-[#00FFBB] to-[#00E980]'
    },
    {
      title: 'Margem (%)',
      value: `${mockData.margin.value}%`,
      change: mockData.margin.change,
      trend: mockData.margin.trend,
      icon: PieChart,
      color: 'from-[#015061] to-[#007A7F]'
    },
    {
      title: 'Investimentos',
      value: formatCurrency(mockData.investments.value),
      change: mockData.investments.change,
      trend: mockData.investments.trend,
      icon: BarChart3,
      color: 'from-[#00E980] to-[#007A7F]'
    },
    {
      title: 'Caixa Disponível',
      value: formatCurrency(mockData.cash.value),
      change: mockData.cash.change,
      trend: mockData.cash.trend,
      icon: DollarSign,
      color: 'from-[#00FFBB] to-[#015061]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.trend === 'up';
        
        return (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <div className="flex items-center space-x-1">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{card.change}%
                  </span>
                  <span className="text-sm text-gray-500">vs mês anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}