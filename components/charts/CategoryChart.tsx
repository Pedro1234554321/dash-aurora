'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Marketing', value: 320000, percentage: 35 },
  { name: 'Operacional', value: 250000, percentage: 27 },
  { name: 'Pessoal', value: 180000, percentage: 20 },
  { name: 'Tecnologia', value: 120000, percentage: 13 },
  { name: 'Outros', value: 45000, percentage: 5 }
];

const COLORS = ['#00E980', '#00FFBB', '#015061', '#007A7F', '#10B981'];

export default function CategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          formatter={(value, entry) => (
            <span style={{ color: entry.color, fontWeight: 500 }}>
              {value} ({entry.payload?.percentage}%)
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}