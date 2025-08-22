'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardCards from '@/components/DashboardCards';
import ChartsSection from '@/components/ChartsSection';
import TransactionsTable from '@/components/TransactionsTable';
import FilterPanel from '@/components/FilterPanel';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    period: '30d',
    category: 'all',
    type: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          collapsed={sidebarCollapsed}
        />
        
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
              <p className="text-gray-600 mt-1">Visão geral da sua inteligência financeira</p>
            </div>
          </div>

          <FilterPanel filters={filters} onFiltersChange={setFilters} />
          
          <DashboardCards filters={filters} />
          
          <ChartsSection filters={filters} />
          
          <TransactionsTable filters={filters} />
        </main>
      </div>
    </div>
  );
}