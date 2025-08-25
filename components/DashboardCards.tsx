'use client';

import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { DashboardDataType } from '../app/dashboard/types';

interface DashboardCardsProps {
  dashboardData: DashboardDataType;
}

export default function DashboardCards({ dashboardData }: DashboardCardsProps) {
  // Obter dados do mês mais recente e do mês anterior
  const summaryData = dashboardData.monthlyComparison || [];
  const lastMonth = Array.isArray(summaryData) && summaryData.length > 0 ? summaryData[0] : {};
  const previousMonth = Array.isArray(summaryData) && summaryData.length > 1 ? summaryData[1] : {};
  
  // Calcular variações percentuais
  const calculateChange = (current: number, previous: number) => {
    // Se ambos forem zero, não houve variação
    if (current === 0 && previous === 0) return 0;
    
    // Se o valor anterior for zero, mas o atual não, é um aumento de 100%
    if (previous === 0 && current > 0) return 100;
    
    // Se o valor atual for zero, mas o anterior não, é uma diminuição de 100%
    if (current === 0 && previous > 0) return -100;
    
    // Cálculo normal para outros casos
    return ((current - previous) / previous) * 100;
  };
  
  // Cards personalizados sem informações financeiras
  const cards = [
    {
      title: 'Inteligência Financeira',
      value: 'Painel Principal',
      change: 0,
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.trend === 'up';
        
        return (
          <Card key={index} className="relative overflow-hidden shadow-sm border-none hover:shadow-md transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            <CardHeader className="pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
                {card.title}
                <div className={`p-1.5 rounded-md bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-1">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{card.value}</p>
                <div className="flex items-center space-x-1">
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '+' : ''}{Math.abs(card.change).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-400 ml-1">vs mês anterior</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}