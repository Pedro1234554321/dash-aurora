'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', marketing: 45000, operacional: 78000, pessoal: 120000 },
  { month: 'Fev', marketing: 52000, operacional: 82000, pessoal: 125000 },
  { month: 'Mar', marketing: 48000, operacional: 79000, pessoal: 130000 },
  { month: 'Abr', marketing: 61000, operacional: 85000, pessoal: 128000 },
  { month: 'Mai', marketing: 55000, operacional: 88000, pessoal: 135000 },
  { month: 'Jun', marketing: 67000, operacional: 92000, pessoal: 140000 },
];

export default function ExpenseChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          formatter={(value: number, name: string) => [
            `R$ ${value.toLocaleString('pt-BR')}`, 
            name.charAt(0).toUpperCase() + name.slice(1)
          ]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Bar dataKey="marketing" stackId="a" fill="#00E980" radius={[0, 0, 0, 0]} />
        <Bar dataKey="operacional" stackId="a" fill="#00FFBB" radius={[0, 0, 0, 0]} />
        <Bar dataKey="pessoal" stackId="a" fill="#015061" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}