import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult;
    }
    
    const userId = sessionResult.userId;
    console.log('Buscando padrão de gastos por período para o usuário:', userId);

    try {
      const query = `
        SELECT 
          periodo,
          total_gasto,
          media_gasto
        FROM padrao_gasto_periodo_mes 
        WHERE usuario_id = $1
        ORDER BY 
          CASE periodo
            WHEN 'inicio' THEN 1
            WHEN 'meio' THEN 2
            WHEN 'fim' THEN 3
            ELSE 4
          END
      `;

      const result = await pool.query(query, [userId]);
      
      console.log(`Encontrados ${result.rowCount} registros de padrão de gastos`);

      const mappedData = result.rows.map(row => ({
        periodo_mes: row.periodo,
        total_gasto: parseFloat(row.total_gasto) || 0,
        media_por_transacao: parseFloat(row.media_gasto) || 0,
        period: row.periodo,
        totalSpent: parseFloat(row.total_gasto) || 0,
        averagePerTransaction: parseFloat(row.media_gasto) || 0
      }));

      return NextResponse.json({
        success: true,
        data: mappedData
      });
    } catch (dbError) {
      console.error('Erro ao consultar o banco de dados:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao consultar o banco de dados'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao buscar padrão de gastos por período:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar padrão de gastos por período'
    }, { status: 500 });
  }
}
