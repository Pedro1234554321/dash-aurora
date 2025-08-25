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
    const months = parseInt(url.searchParams.get('months') || '6');

    // Verificando a estrutura da tabela primeiro
    console.log('Verificando estrutura da tabela resumo_mensal');
    const tableInfo = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resumo_mensal'
    `);
    
    console.log('Tabela resumo_mensal existe?', tableInfo.rows.length > 0);
    
    if (tableInfo.rows.length > 0) {
      console.log('Colunas disponíveis:', tableInfo.rows.map(r => r.column_name));
      
      try {
        // Usar a tabela resumo_mensal que existe no banco
        const result = await pool.query(
          `SELECT 
            usuario_id, 
            mes as month_date, 
            total_entradas as total_income, 
            total_saidas as total_expense,
            (total_entradas - total_saidas) as net_income
          FROM resumo_mensal 
          WHERE usuario_id = $1 
          ORDER BY mes DESC 
          LIMIT $2`,
          [userId, months]
        );
        
        console.log('Dados do resumo mensal encontrados:', result.rows.length);
        return NextResponse.json(result.rows);
      } catch (dbError) {
        console.error('Erro ao consultar a tabela resumo_mensal:', dbError);
        throw dbError;
      }
    } else {
      // A tabela não existe, vamos fazer o cálculo a partir das transações
      console.log('Tabela resumo_mensal não encontrada, calculando a partir das transações');
      
      try {
        // Verificar se a tabela transacoes existe
        const transTable = await pool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'transacoes'
        `);
        
        if (transTable.rows.length > 0) {
          // Gerar resumo mensal a partir das transações
          const result = await pool.query(
            `SELECT 
              $1 as usuario_id,
              to_char(date_trunc('month', data), 'YYYY-MM-DD') as month_date,
              COALESCE(SUM(CASE WHEN tipo = 'income' THEN valor ELSE 0 END), 0) as total_income,
              COALESCE(SUM(CASE WHEN tipo = 'expense' THEN ABS(valor) ELSE 0 END), 0) as total_expense,
              COALESCE(SUM(CASE WHEN tipo = 'income' THEN valor 
                             WHEN tipo = 'expense' THEN -ABS(valor) 
                             ELSE 0 END), 0) as net_income
            FROM transacoes
            WHERE usuario_id = $1
            GROUP BY date_trunc('month', data)
            ORDER BY date_trunc('month', data) DESC
            LIMIT $2`,
            [userId, months]
          );
          
          console.log('Resumo mensal calculado a partir das transações:', result.rows.length);
          return NextResponse.json(result.rows);
        } else {
          throw new Error('Tabela transacoes não encontrada');
        }
      } catch (altError) {
        console.error('Erro ao calcular resumo mensal a partir das transações:', altError);
        throw altError;
      }
    }
    
  } catch (error) {
    console.error('Erro ao buscar resumo mensal:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
      { status: 500 }
    );
  }
}
