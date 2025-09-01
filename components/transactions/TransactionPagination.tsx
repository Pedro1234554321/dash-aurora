'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  isLoading: boolean;
  onGoToFirstPage: () => void;
  onGoToPreviousPage: () => void;
  onGoToNextPage: () => void;
  onGoToLastPage: () => void;
}

export function TransactionPagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  isLoading,
  onGoToFirstPage,
  onGoToPreviousPage,
  onGoToNextPage,
  onGoToLastPage
}: TransactionPaginationProps) {
  const startRecord = ((currentPage - 1) * pageSize) + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);
  
  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onGoToFirstPage}
          disabled={currentPage === 1 || isLoading}
          className="h-8 w-8 p-0 flex items-center justify-center rounded-md text-xs"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Primeira página</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onGoToPreviousPage}
          disabled={currentPage === 1 || isLoading}
          className="h-8 w-8 p-0 flex items-center justify-center rounded-md text-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Página anterior</span>
        </Button>
        <div className="flex items-center text-sm text-muted-foreground">
          Página <span className="font-medium text-foreground mx-1">{currentPage}</span> 
          de <span className="font-medium text-foreground mx-1">{totalPages || 1}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onGoToNextPage}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 w-8 p-0 flex items-center justify-center rounded-md text-xs"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próxima página</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onGoToLastPage}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 w-8 p-0 flex items-center justify-center rounded-md text-xs"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Última página</span>
        </Button>
      </div>
      
      <div className="text-sm text-gray-500">
        Mostrando <span className="font-medium text-gray-700">{startRecord} - {endRecord}</span> de <span className="font-medium text-gray-700">{totalRecords}</span> transações
      </div>
    </div>
  );
}
