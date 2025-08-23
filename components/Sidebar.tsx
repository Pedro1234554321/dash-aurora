'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  Settings, 
  FileText,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
}

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', active: true },
  { icon: TrendingUp, label: 'Análises', active: false },
  { icon: CreditCard, label: 'Transações', active: false },
  { icon: PieChart, label: 'Relatórios', active: false },
  { icon: Calendar, label: 'Planejamento', active: false },
  { icon: Users, label: 'Clientes', active: false },
  { icon: FileText, label: 'Documentos', active: false },
  { icon: Settings, label: 'Configurações', active: false },
];

export default function Sidebar({ collapsed }: SidebarProps) {
  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <img 
            src="https://public-images-b573dd662d7c89a635d85c00405f50b1.s3.us-east-1.amazonaws.com/logos/IMG_6066.PNG"
            alt="Aurora Logo"
            className="w-8 h-8 object-contain rounded-lg bg-white p-1"
          />
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold text-[#015061]">AURORA</h2>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Inteligência Financeira</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href="#"
              className={cn(
                "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors",
                item.active && "bg-gradient-to-r from-[#00E980]/10 to-[#00FFBB]/10 border-r-2 border-[#00E980] text-[#015061]"
              )}
            >
              <Icon className={cn("w-5 h-5", item.active ? "text-[#00E980]" : "text-gray-500")} />
              {!collapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );
}