'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Definição dos dados no formato real da API
interface MonthlyData {
  // Formato portugues
  month_date?: string;
  total_income?: string | number;
  total_expense?: string | number;
  net_income?: string | number;
  usuario_id?: string;
  
  // Campos processados para exibição
  month_label?: string;
}

interface MonthlyComparisonChartProps {
  months?: number;
  data: any;
}

export default function MonthlyComparisonChart({ months = 6, data = [] }: MonthlyComparisonChartProps) {

  // Adapta os dados para o formato esperado pelo componente
  const adaptData = () => {
    // Verifica se os dados são um objeto com propriedade data
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data || [];
    }
    
    // Se for array, usa diretamente
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  };
  
  // Adapta e ordena os dados por data (mais recente primeiro)
  const rawData = adaptData();
  
  // Ordenar os dados por data (mais recente primeiro)
  const sortedData = [...rawData].sort((a, b) => {
    const dateA = a.month_date ? new Date(a.month_date).getTime() : 0;
    const dateB = b.month_date ? new Date(b.month_date).getTime() : 0;
    return dateB - dateA; // Ordem decrescente (mais recente primeiro)
  });
  
  // Filtra os dados para incluir apenas os meses solicitados
  const filteredData = sortedData
    ? sortedData.slice(0, months)
    : [];

  // Verifica se temos dados para exibir
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full w-full text-sm text-gray-500">
        Sem dados disponíveis para comparação mensal.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-50 overflow-hidden relative">
      {/* Elemento decorativo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-400"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Comparativo Mensal</h3>
          <p className="text-sm text-gray-500 mt-1">Análise de receitas e despesas</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-1 text-sm text-gray-500 font-medium border border-gray-100">
          {filteredData.length} {filteredData.length === 1 ? 'mês' : 'meses'}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={filteredData.map((item: MonthlyData) => {
            const month = item.month_date ? new Date(item.month_date) : new Date();
            return {
              month_label: month.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
              income: Number(item.total_income || 0),
              expenses: Number(item.total_expense || 0),
              balance: Number(item.net_income || 0)
            };
          })}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
          barGap={8}
          barCategoryGap={16}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="month_label" 
            axisLine={{ stroke: '#e5e7eb' }} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(236, 253, 245, 0.4)' }}
            formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
            labelFormatter={(label) => `Mês: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '12px'
            }}
          />
          <Legend 
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ paddingTop: 20 }}
          />
          <Bar 
            name="Entradas" 
            dataKey="income" 
            fill="#10b981" 
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
          <Bar 
            name="Saídas" 
            dataKey="expenses" 
            fill="#ef4444" 
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
          <Bar 
            name="Saldo" 
            dataKey="balance" 
            fill="#3b82f6" 
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
