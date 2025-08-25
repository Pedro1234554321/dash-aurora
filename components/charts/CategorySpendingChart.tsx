'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Definição dos dados conforme vêm da API (suporte a diferentes formatos)
interface CategoryData {
  // Formato em português
  categoria?: string;
  tipo_categoria?: string;
  total_gasto?: number;
  percentual?: number;
  
  // Formato em inglês
  category?: string;
  categoryType?: string;
  totalSpent?: number;
  percentage?: number;
}

interface CategorySpendingChartProps {
  selectedMonth?: string;
  data: any; // Aceita qualquer formato para adaptação
}

// Aurora Finance color palette
const COLORS = ['#00E980', '#00FFBB', '#015061', '#007A7F', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

export default function CategorySpendingChart({ selectedMonth, data = [] }: CategorySpendingChartProps) {
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

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-full w-full text-sm text-gray-500">
        Sem dados disponíveis para o período selecionado.
      </div>
    );
  }

  // Format data for chart
  const formattedData = chartData.map((item: CategoryData, index: number) => ({
    name: item.categoria || item.category || `Categoria ${index + 1}`,
    value: Math.abs(Number(item.total_gasto || item.totalSpent || 0)),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {formattedData.map((entry: { color: string }, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color, fontWeight: 500 }}>
                {value} ({entry.payload?.percentual}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
