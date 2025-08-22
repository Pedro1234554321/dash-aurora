'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RevenueChart from '@/components/charts/RevenueChart';
import ExpenseChart from '@/components/charts/ExpenseChart';
import CategoryChart from '@/components/charts/CategoryChart';
import TrendChart from '@/components/charts/TrendChart';

interface ChartsSectionProps {
  filters: any;
}

export default function ChartsSection({ filters }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="lg:col-span-2 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Análise de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="revenue">Receitas</TabsTrigger>
              <TabsTrigger value="expenses">Despesas</TabsTrigger>
              <TabsTrigger value="profit">Lucro</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="mt-6">
              <RevenueChart />
            </TabsContent>
            
            <TabsContent value="expenses" className="mt-6">
              <ExpenseChart />
            </TabsContent>
            
            <TabsContent value="profit" className="mt-6">
              <TrendChart />
            </TabsContent>
            
            <TabsContent value="trends" className="mt-6">
              <TrendChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryChart />
        </CardContent>
      </Card>
    </div>
  );
}