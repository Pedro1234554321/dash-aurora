import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

// Força o uso do runtime Node.js completo (não o Edge Runtime)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult; 
    }
    
    const userId = sessionResult.userId;
    console.log('Buscando visão geral dos usuários para o admin:', userId);

    try {
      const query = `
        SELECT 
          usuario_id, 
          usuario_nome, 
          usuario_email, 
          total_entradas, 
          total_despesas, 
          saldo
        FROM vw_entrada_vs_despesa
        WHERE usuario_id = $1
      `;
      
      console.log('Buscando dados de receitas e despesas para o usuário:', userId);

      const result = await pool.query(query, [userId]);
      
      console.log(`Encontrados ${result.rowCount} registros de receitas e despesas para o usuário`);

      return NextResponse.json({
        success: true,
        data: result.rows.map(row => ({
          id: row.usuario_id,
          nome: row.usuario_nome,
          email: row.usuario_email,
          totalEntradas: parseFloat(row.total_entradas) || 0,
          totalDespesas: parseFloat(row.total_despesas) || 0,
          saldo: parseFloat(row.saldo) || 0
        }))
      });
    } catch (dbError) {
      console.error('Erro ao consultar o banco de dados:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao consultar o banco de dados'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao buscar visão geral dos usuários:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar visão geral dos usuários'
    }, { status: 500 });
  }
}
