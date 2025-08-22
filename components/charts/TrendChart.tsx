'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', lucro: 65000, meta: 70000 },
  { month: 'Fev', lucro: 72000, meta: 70000 },
  { month: 'Mar', lucro: 85000, meta: 70000 },
  { month: 'Abr', lucro: 68000, meta: 70000 },
  { month: 'Mai', lucro: 95000, meta: 70000 },
  { month: 'Jun', lucro: 110000, meta: 70000 },
  { month: 'Jul', lucro: 125000, meta: 70000 },
  { month: 'Ago', lucro: 118000, meta: 70000 },
  { month: 'Set', lucro: 135000, meta: 70000 },
  { month: 'Out', lucro: 142000, meta: 70000 },
  { month: 'Nov', lucro: 158000, meta: 70000 },
  { month: 'Dez', lucro: 165000, meta: 70000 }
];

export default function TrendChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00E980" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#00E980" stopOpacity={0}/>
          </linearGradient>
        </defs>
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
            name === 'lucro' ? 'Lucro' : 'Meta'
          ]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="lucro" 
          stroke="#00E980" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorProfit)" 
        />
        <Area 
          type="monotone" 
          dataKey="meta" 
          stroke="#015061" 
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="transparent"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}