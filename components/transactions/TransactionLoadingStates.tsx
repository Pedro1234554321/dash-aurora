'use client';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export function TransactionLoadingState() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        <p className="text-gray-500 mt-3 text-sm">Carregando transações...</p>
      </div>
    </div>
  );
}

export function TransactionEmptyState({ 
  message = "Nenhuma transação encontrada", 
  subMessage = "Altere os filtros ou adicione novas transações"
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-gray-500 text-sm mt-1">{subMessage}</p>
    </div>
  );
}
