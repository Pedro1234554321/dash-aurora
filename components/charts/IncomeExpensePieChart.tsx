'use client';

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

// Cores para receitas e despesas
const COLORS = ['#00C49F', '#FF8042'];

type IncomeExpenseData = {
  name: string;
  value: number;
};

type IncomeExpensePieChartProps = {
  income: number;
  expenses: number;
  title?: string;
  period?: string;
};

export default function IncomeExpensePieChart({ 
  income = 0, 
  expenses = 0, 
  title = "Receitas vs Despesas",
  period = "Últimos 6 meses"
}: IncomeExpensePieChartProps) {
  
  // Certificar que expenses seja positivo para exibição no gráfico
  const expenseValue = Math.abs(expenses || 0);
  
  // Preparar dados para o gráfico
  const data: IncomeExpenseData[] = [
    { name: 'Receitas', value: Math.max(income || 0, 0) },
    { name: 'Despesas', value: Math.max(expenseValue, 0) }
  ];
  
  // Calcular o saldo
  const balance = income - expenseValue;
  
  // Verificar se temos dados suficientes para mostrar o gráfico
  const hasData = income > 0 || expenseValue > 0;
  
  // Calcular porcentagens para label
  const total = income + expenseValue;
  const incomePercentage = total > 0 ? Math.round((income / total) * 100) : 0;
  const expensesPercentage = total > 0 ? Math.round((expenseValue / total) * 100) : 0;
  
  // Formatar texto de porcentagem para o gráfico
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{period}</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {!hasData ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-muted-foreground">Sem dados suficientes para exibir o gráfico</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 p-2 rounded">
            <p className="text-xs text-gray-500">Receitas</p>
            <p className="text-green-600 font-semibold">{formatCurrency(income)}</p>
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <p className="text-xs text-gray-500">Despesas</p>
            <p className="text-orange-600 font-semibold">{formatCurrency(Math.abs(expenses))}</p>
          </div>
          <div className={`${balance >= 0 ? 'bg-blue-50' : 'bg-red-50'} p-2 rounded`}>
            <p className="text-xs text-gray-500">Saldo</p>
            <p className={`${balance >= 0 ? 'text-blue-600' : 'text-red-600'} font-semibold`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
