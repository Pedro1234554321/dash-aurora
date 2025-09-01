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
    
    const session: UserSession = sessionResult;
    const userId = session.userId;
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    
    console.log('Filtrando gastos por categoria para o mês:', month);
    
    // Verificando a estrutura da tabela primeiro
    console.log('Verificando estrutura da tabela gasto_por_categoria_mensal');
    const tableInfo = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'gasto_por_categoria_mensal'
    `);
    
    console.log('Tabela gasto_por_categoria_mensal existe?', tableInfo.rows.length > 0);
    console.log('Colunas disponíveis:', tableInfo.rows.map(r => r.column_name));
    
    // Verificando se existem dados na tabela
    let result;
    
    try {
      result = await pool.query(`
        SELECT 
          categoria,
          tipo_categoria,
          total_gasto,
          round((total_gasto * 100.0 / 
            CASE WHEN (SELECT SUM(total_gasto) FROM gasto_por_categoria_mensal 
                      WHERE usuario_id = $1 AND to_char(mes, 'YYYY-MM') = $2) > 0 
                 THEN (SELECT SUM(total_gasto) FROM gasto_por_categoria_mensal 
                      WHERE usuario_id = $1 AND to_char(mes, 'YYYY-MM') = $2)
                 ELSE 1 END
          ), 1) as percentual
        FROM gasto_por_categoria_mensal
        WHERE usuario_id = $1
        AND to_char(mes, 'YYYY-MM') = $2
        ORDER BY total_gasto DESC
      `, [userId, month]);
    } catch (error) {
      console.log('Erro ao buscar da tabela gasto_por_categoria_mensal:', error);
      
      // Alternativa: Buscar dados agrupados da tabela de transações
      try {
        console.log('Tentando alternativa com a tabela transacoes');
        result = await pool.query(`
          SELECT 
            categoria as categoria,
            tipo as tipo_categoria,
            SUM(ABS(valor)) as total_gasto,
            round((SUM(ABS(valor)) * 100.0 / 
              CASE WHEN (SELECT SUM(ABS(valor)) FROM transacoes 
                         WHERE usuario_id = $1 AND tipo = 'expense'
                         AND to_char(data, 'YYYY-MM') = $2) > 0 
                   THEN (SELECT SUM(ABS(valor)) FROM transacoes 
                         WHERE usuario_id = $1 AND tipo = 'expense'
                         AND to_char(data, 'YYYY-MM') = $2)
                   ELSE 1 END
            ), 1) as percentual
          FROM transacoes
          WHERE usuario_id = $1
          AND tipo = 'expense'
          AND to_char(data, 'YYYY-MM') = $2
          GROUP BY categoria, tipo
          ORDER BY total_gasto DESC
        `, [userId, month]);
      } catch (altError) {
        console.log('Erro na consulta alternativa:', altError);
        throw altError;
      }
    }
    
    console.log('Resultados dos gastos por categoria:', result?.rows?.length || 0, 'registros');
    
    // Formatar a resposta para o formato esperado pelo front-end
    const formattedData = result.rows.map(row => ({
      category: row.categoria,
      type: row.tipo_categoria,
      amount: parseFloat(row.total_gasto),
      percentage: parseFloat(row.percentual)
    }));
    
    return NextResponse.json({ data: formattedData });
    
  } catch (error) {
    console.error('Erro ao buscar gastos por categoria:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
