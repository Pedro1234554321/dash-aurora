// Tipos de dados para o Dashboard

export interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
  totalTransactions: number;
  period?: string;
}

export interface CategorySpendingItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface PaginationData {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface DashboardDataType {
  summary: FinancialSummary | null;
  transactions: any[];
  spendingPatterns: any[];
  recurringTransactions: any[];
  categorySpending: CategorySpendingItem[];
  monthlyComparison?: any[];
  pagination?: PaginationData;
}
