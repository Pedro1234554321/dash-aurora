'use client';

import { Card, CardContent } from './ui/card';
import { User, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
    <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md mb-4">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2 shrink-0">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div className="flex flex-col flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold truncate">{name}</h2>
              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 text-xs rounded-full whitespace-nowrap">
                ID: {id.substring(0, 8)}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 truncate">
              {email}
            </div>
            {phone && <div className="text-xs sm:text-sm text-gray-600">{phone}</div>}
          </div>
        </div>
        
        {/* Informações financeiras do usuário */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
            <div className="flex items-center mb-0.5 sm:mb-1">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mr-0.5 sm:mr-1" />
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">ENTRADAS</span>
            </div>
            <span className="text-xs sm:text-sm text-emerald-600 font-semibold">{formatCurrency(totalEntradas)}</span>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
            <div className="flex items-center mb-0.5 sm:mb-1">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500 mr-0.5 sm:mr-1" />
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">DESPESAS</span>
            </div>
            <span className="text-xs sm:text-sm text-rose-600 font-semibold">{formatCurrency(totalDespesas)}</span>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
            <div className="flex items-center mb-0.5 sm:mb-1">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-0.5 sm:mr-1" />
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">SALDO</span>
            </div>
            <span className={`text-xs sm:text-sm font-semibold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
