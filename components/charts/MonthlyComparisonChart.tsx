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
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Comparativo Mensal</h3>
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
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month_label" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
            labelFormatter={(label) => `Mês: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar name="Entradas" dataKey="income" fill="#00E980" radius={[4, 4, 0, 0]} />
          <Bar name="Saídas" dataKey="expenses" fill="#007A7F" radius={[4, 4, 0, 0]} />
          <Bar name="Saldo" dataKey="balance" fill="#015061" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
