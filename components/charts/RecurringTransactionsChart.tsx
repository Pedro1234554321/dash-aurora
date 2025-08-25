'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define o formato dos dados como está realmente vindo da API
interface RecurringTransactionData {
  name?: string;
  category?: string;
  occurrences?: number;
  totalSpent?: number;
  monthlyAverage?: number;
  
  // Campos alternativos
  nome?: string;
  categoria?: string;
  qtd_ocorrencias?: number;
  total_gasto?: number;
  media_mensal?: number;
}

interface RecurringTransactionsChartProps {
  data: any;
}

export default function RecurringTransactionsChart({ data = [] }: RecurringTransactionsChartProps) {
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
  
  const chartData = adaptData();
  
  // Verifica se temos dados para exibir
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Transações Recorrentes</h3>
        <div className="flex justify-center items-center h-64 text-sm text-gray-500">
          Sem dados de transações recorrentes disponíveis.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Principais Despesas Recorrentes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 100,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tickFormatter={(value) => `R$${value.toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short' })}`}
          />
          <YAxis 
            type="category" 
            dataKey={(item) => item.nome || item.name || 'Sem nome'}
            width={80}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name: string) => {
              if (name === "Total Gasto" || name === "Média Mensal") {
                return [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name];
              }
              return [value, name];
            }}
            labelFormatter={(value) => `${value}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar name="Total Gasto" dataKey={(item) => Number(item.total_gasto || item.totalSpent || 0)} fill="#007A7F" />
          <Bar name="Média Mensal" dataKey={(item) => Number(item.media_mensal || item.monthlyAverage || 0)} fill="#00E980" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
