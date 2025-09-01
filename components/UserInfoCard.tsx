'use client';

import { User, ArrowUp, ArrowDown, DollarSign, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { formatCurrency } from '@/lib/utils';

interface UserInfoProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalEntradas?: number;
  totalDespesas?: number;
  saldo?: number;
}

export default function UserInfoCard({ 
  id, 
  name, 
  email, 
  phone, 
  totalEntradas = 0, 
  totalDespesas = 0, 
  saldo = 0 
}: UserInfoProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6 sm:p-8 relative">
        {/* Elemento decorativo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-teal-50 rounded-bl-full opacity-30 -z-10" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full p-3 shadow-md">
              <User className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center mb-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mr-3 truncate">
                  {name || 'Usuário'}
                </h3>
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-teal-500 text-teal-600 bg-teal-50 font-medium">
                  ID: {id?.substring(0, 8) || 'N/A'}
                </Badge>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 truncate mb-0.5">
                <span className="inline-block w-4 mr-1 text-gray-400">✉️</span> {email || 'Sem email'}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 truncate">
                <span className="inline-block w-4 mr-1 text-gray-400">📱</span> {phone || 'Sem telefone'}
              </div>
            </div>
          </div>
          {/* Botão Editar Perfil removido */}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-50 p-2 sm:p-2.5 rounded-lg shadow-sm">
                    <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                  <span className="ml-3 text-sm sm:text-base font-medium text-gray-700">Entradas</span>
                </div>
              </div>
              <div className="mt-3 text-base sm:text-xl font-bold text-emerald-600">
                {formatCurrency(totalEntradas)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-red-100 to-red-50 p-2 sm:p-2.5 rounded-lg shadow-sm">
                    <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <span className="ml-3 text-sm sm:text-base font-medium text-gray-700">Despesas</span>
                </div>
              </div>
              <div className="mt-3 text-base sm:text-xl font-bold text-red-600">
                {formatCurrency(totalDespesas)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-50 p-2 sm:p-2.5 rounded-lg shadow-sm">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <span className="ml-3 text-sm sm:text-base font-medium text-gray-700">Saldo</span>
                </div>
              </div>
              <div className="mt-3 text-base sm:text-xl font-bold text-blue-600">
                {formatCurrency(saldo)}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
