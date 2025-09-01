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

// Cores para as diferentes categorias no gráfico - paleta moderna
const COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f97316', // orange-500
  '#f43f5e', // rose-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

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
    // Log para depuração
    console.log('CategoryPieChart - Dados recebidos:', data);
    
    // Se não houver dados, não renderizar
    if (!data || data.length < 1) {
      console.log('CategoryPieChart - Sem dados para exibir');
      return [];
    }
    
    // Verificar se há pelo menos uma categoria com valor positivo
    const hasPositiveAmount = data.some(item => {
      const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0');
      return amount > 0;
    });
    
    if (!hasPositiveAmount) {
      console.log('CategoryPieChart - Sem valores positivos');
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
      <Card className="col-span-1 border-0 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b pb-4">
          <CardTitle className="text-lg font-bold text-gray-800">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 bg-white">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Dados insuficientes para exibir o gráfico</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 border-0 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="border-b pb-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800">{title}</CardTitle>
          <div className="bg-white text-xs font-medium text-gray-500 rounded-full px-2.5 py-1 shadow-sm border border-gray-100">
            {chartData.length} {chartData.length === 1 ? 'categoria' : 'categorias'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-3/5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  innerRadius={30}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="category"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.7}
                      stroke={activeIndex === index ? '#fff' : 'none'}
                      strokeWidth={activeIndex === index ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Valor']}
                  labelFormatter={(label) => `Categoria: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-2/5 pl-0 md:pl-4 mt-4 md:mt-0">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Distribuição</h4>
            <div className="space-y-3 max-h-60 overflow-auto pr-2">
              {chartData.map((entry, index) => (
                <div 
                  key={`legend-${index}`} 
                  className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                      {entry.category}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs font-semibold text-gray-900">
                      {formatCurrency(entry.amount)}
                    </span>
                    <span className="text-xs ml-2 text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5">
                      {(entry.percentage * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
