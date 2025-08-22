'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 180000, target: 200000 },
  { month: 'Fev', revenue: 195000, target: 200000 },
  { month: 'Mar', revenue: 220000, target: 200000 },
  { month: 'Abr', revenue: 185000, target: 200000 },
  { month: 'Mai', revenue: 240000, target: 200000 },
  { month: 'Jun', revenue: 265000, target: 200000 },
  { month: 'Jul', revenue: 285000, target: 200000 },
  { month: 'Ago', revenue: 270000, target: 200000 },
  { month: 'Set', revenue: 295000, target: 200000 },
  { month: 'Out', revenue: 310000, target: 200000 },
  { month: 'Nov', revenue: 325000, target: 200000 },
  { month: 'Dez', revenue: 340000, target: 200000 }
];

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#666' }}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
          labelFormatter={(label) => `${label} 2024`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#00E980" 
          strokeWidth={3}
          dot={{ fill: '#00E980', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#00E980', strokeWidth: 2, fill: 'white' }}
        />
        <Line 
          type="monotone" 
          dataKey="target" 
          stroke="#015061" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}