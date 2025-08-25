'use client';

import { useState } from 'react';
import MonthlyComparisonChart from "./charts/MonthlyComparisonChart";
import CategorySpendingChart from "./charts/CategorySpendingChart";
import SpendingPatternChart from "./charts/SpendingPatternChart";
import RecurringTransactionsChart from "./charts/RecurringTransactionsChart";
import CategoryPieChart from "./charts/CategoryPieChart";
import IncomeExpensePieChart from "./charts/IncomeExpensePieChart";

import { DashboardDataType } from '../app/dashboard/types';

interface ChartsSectionProps {
  dashboardData: DashboardDataType;
  filters?: any;
}

export default function ChartsSection({ dashboardData, filters }: ChartsSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedMonths, setSelectedMonths] = useState<number>(6);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonths(Number(e.target.value));
  };

  // Generate last 12 months options for the dropdown
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = date.toISOString().slice(0, 7);
    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return { value, label };
  });

  // Extrair dados para os gráficos
  const comparativeData = dashboardData.spendingPatterns || [];
  const categoryData = dashboardData.categorySpending || [];
  const recurringData = dashboardData.recurringTransactions || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Análise Financeira</h2>
        
        <div className="flex gap-3 mt-3 md:mt-0">
          <div>
            <select
              id="monthSelect"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="monthsSelect"
              value={selectedMonths}
              onChange={handleMonthsChange}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={3}>Últimos 3 meses</option>
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <MonthlyComparisonChart 
          months={selectedMonths} 
          data={dashboardData.monthlyComparison || []}
        />
        
        {/* Income vs Expense Pie Chart */}
        <IncomeExpensePieChart
          income={dashboardData.summary?.income || 0}
          expenses={dashboardData.summary?.expenses || 0}
          title="Receitas vs Despesas"
        />
        
        {/* Category Spending */}
        <CategorySpendingChart 
          selectedMonth={selectedMonth} 
          data={dashboardData.categorySpending || []}
        />
        
        {/* Category Pie Chart */}
        <CategoryPieChart 
          data={dashboardData.categorySpending || []}
          title="Distribuição de Gastos por Categoria"
        />
        
        {/* Spending Pattern */}
        <SpendingPatternChart 
          selectedMonth={selectedMonth}
          data={dashboardData.spendingPatterns || []}
        />
        
        {/* Recurring Transactions */}
        <RecurringTransactionsChart 
          data={dashboardData.recurringTransactions || []}
        />
      </div>
    </div>
  );
}