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
    
    // Buscar padrão de gasto por período do mês
    const result = await pool.query(`
      SELECT 
        periodo,
        total_gasto,
        media_gasto
      FROM padrao_gasto_periodo_mes
      WHERE usuario_id = $1
      ORDER BY 
        CASE 
          WHEN periodo = 'inicio' THEN 1
          WHEN periodo = 'meio' THEN 2
          WHEN periodo = 'fim' THEN 3
        END
    `, [userId]);
    
    // Formatar a resposta para o formato esperado pelo front-end
    const formattedData = result.rows.map(row => ({
      period: row.periodo,
      totalSpent: parseFloat(row.total_gasto),
      averageSpent: parseFloat(row.media_gasto)
    }));
    
    return NextResponse.json({ data: formattedData });
    
  } catch (error) {
    console.error('Erro ao buscar padrões de gasto:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
