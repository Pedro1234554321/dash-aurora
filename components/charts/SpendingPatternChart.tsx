'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Definição dos dados conforme vêm da API
interface SpendingPatternData {
  periodo: string;
  mediaGasto: number;
  totalGasto: number;
  count: number;
}

const periodTranslations = {
  'inicio': 'Início do mês',
  'meio': 'Meio do mês',
  'fim': 'Final do mês'
};

interface SpendingPatternProps {
  selectedMonth?: string;
  data: any; // Aceita qualquer formato de dados para adaptação
}

export default function SpendingPatternChart({ selectedMonth, data = [] }: SpendingPatternProps) {
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

  // Verificar se temos dados para exibir
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full w-full text-sm text-gray-500">
        Sem dados de padrões de gastos disponíveis.
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Padrão de Gastos por Período do Mês</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData.map((item: SpendingPatternData) => ({
            ...item,
            periodo_label: periodTranslations[item.periodo as keyof typeof periodTranslations] || item.periodo
          }))}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo_label" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
            labelFormatter={(label) => `Período: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar name="Total Gasto" dataKey="totalGasto" fill="#007A7F" radius={[4, 4, 0, 0]} />
          <Bar name="Média por Transação" dataKey="mediaGasto" fill="#00FFBB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
