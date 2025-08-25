'use client';

import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

// Cores para as diferentes categorias no gráfico
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

type CategorySpendingItem = {
  category: string;
  amount: number;
  percentage: number;
};

type CategoryPieChartProps = {
  data: CategorySpendingItem[];
  title?: string;
};

export default function CategoryPieChart({ data = [], title = "Gastos por Categoria" }: CategoryPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Processar os dados para exibição no gráfico
  const chartData = useMemo(() => {
    // Se não houver dados ou menos de 1 categoria com valores positivos, não renderizar
    if (!data || data.length < 1 || !data.some(item => item.amount > 0)) {
      return [];
    }
    
    // Limitar a 7 categorias, agrupando o restante como "Outros"
    const maxCategories = 7;
    let processedData: CategorySpendingItem[] = [];
    
    if (data.length <= maxCategories) {
      processedData = [...data];
    } else {
      // Ordenar por valor e pegar as top categorias
      const sortedData = [...data].sort((a, b) => b.amount - a.amount);
      const topCategories = sortedData.slice(0, maxCategories - 1);
      
      // Calcular "Outros"
      const otherCategories = sortedData.slice(maxCategories - 1);
      const otherAmount = otherCategories.reduce((sum, item) => sum + item.amount, 0);
      const otherPercentage = otherCategories.reduce((sum, item) => sum + item.percentage, 0);
      
      processedData = [
        ...topCategories,
        { 
          category: 'Outros', 
          amount: otherAmount,
          percentage: otherPercentage
        }
      ];
    }
    
    return processedData;
  }, [data]);
  
  const totalAmount = useMemo(() => {
    return data.reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Se não houver dados suficientes, mostrar mensagem
  if (chartData.length < 1) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Dados insuficientes para exibir o gráfico</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
                nameKey="category"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    opacity={activeIndex === index ? 1 : 0.8}
                    stroke={activeIndex === index ? '#fff' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Legend layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Valor']}
                labelFormatter={(label) => `Categoria: ${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
