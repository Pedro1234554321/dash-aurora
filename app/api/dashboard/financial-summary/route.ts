import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, UserSession } from '../../../../lib/auth';

// Força o uso do runtime Node.js completo (não o Edge Runtime)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    // Check if it's an error response (not a UserSession)
    if ('status' in sessionResult) {
      return sessionResult; // Return the error response
    }
    
    // Now TypeScript knows sessionResult is UserSession
    const session: UserSession = sessionResult;
    const userId = session.userId;

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '180d'; // Default: 6 meses

    let periodClause;
    let periodText;

    switch (period) {
      case '30d':
        periodClause = "data >= CURRENT_DATE - INTERVAL '30 days'";
        periodText = 'Últimos 30 dias';
        break;
      case '90d':
        periodClause = "data >= CURRENT_DATE - INTERVAL '90 days'";
        periodText = 'Últimos 90 dias';
        break;
      case '180d':
        periodClause = "data >= CURRENT_DATE - INTERVAL '180 days'";
        periodText = 'Últimos 6 meses';
        break;
      case '365d':
      default:
        periodClause = "data >= CURRENT_DATE - INTERVAL '365 days'";
        periodText = 'Últimos 12 meses';
        break;
    }

    try {
      // Verificando a estrutura da tabela primeiro
      console.log('Verificando estrutura da tabela transacoes para resumo financeiro');
      const tableInfo = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'transacoes'
      `);
      
      console.log('Colunas disponíveis em transacoes:', tableInfo.rows.map(r => r.column_name));
      
      // Buscar resumo financeiro - ajustando a consulta para o formato correto das colunas
      const result = await pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN tipo = 'income' THEN valor ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN tipo = 'expense' THEN valor ELSE 0 END), 0) as expenses,
          COUNT(*) as total_transactions
        FROM transacoes
        WHERE usuario_id = $1
        AND ${periodClause}
      `, [userId]);
      
      // Verificar se há dados ou se os valores são zero
      console.log('Resultado da consulta de resumo financeiro:', result.rows[0]);
      
      // Verificar consulta direta das transações para diagnóstico
      const diagnosticResult = await pool.query(`
        SELECT 
          id, 
          tipo, 
          valor, 
          data 
        FROM transacoes 
        WHERE usuario_id = $1 
        LIMIT 10
      `, [userId]);
      
      console.log('Amostra de transações disponíveis:', diagnosticResult.rows);
      console.log('Total de transações encontradas:', diagnosticResult.rowCount);
      
      const row = result.rows[0];
      
      // Formatar a resposta
      const summary = {
        income: parseFloat(row.income) || 0,
        expenses: parseFloat(row.expenses) || 0,
        balance: parseFloat(row.income) - Math.abs(parseFloat(row.expenses)),
        totalTransactions: parseInt(row.total_transactions) || 0,
        period: periodText
      };
      
      return NextResponse.json(summary);
      
    } catch (dbError) {
      console.error('Erro na consulta de resumo financeiro:', dbError);
      
      // Retornar dados simulados como fallback
      const mockSummary = {
        income: 8500.00,
        expenses: -5320.45,
        balance: 3179.55,
        totalTransactions: 54,
        period: periodText,
        simulated: true
      };
      
      return NextResponse.json(mockSummary);
    }
    
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de resumo financeiro' },
      { status: 500 }
    );
  }
}
