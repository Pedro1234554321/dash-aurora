import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

// Força o uso do runtime Node.js completo (não o Edge Runtime)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Usando a conexão com o banco de dados PostgreSQL do arquivo db.ts

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro
    }
    
    const userId = sessionResult.userId;
    console.log('Buscando resumo financeiro do usuário:', userId);

    try {
      console.log(`Buscando dados financeiros para o usuário ID: ${userId}`);
      
      // Consulta SQL para buscar os dados da view para o usuário logado
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

      const result = await pool.query(query, [userId]);
      
      if (result.rowCount === 0) {
        console.log('Nenhum dado encontrado para o usuário na view.');
        return NextResponse.json({
          success: false,
          error: 'Nenhum dado encontrado para o usuário'
        }, { status: 404 });
      }
      
      const userData = result.rows[0];
      console.log('Dados do usuário recuperados com sucesso');

      return NextResponse.json({
        success: true,
        data: {
          id: userData.usuario_id,
          nome: userData.usuario_nome,
          email: userData.usuario_email,
          totalEntradas: parseFloat(userData.total_entradas) || 0,
          totalDespesas: parseFloat(userData.total_despesas) || 0,
          saldo: parseFloat(userData.saldo) || 0
        }
      });
    } catch (dbError) {
      console.error('Erro ao buscar dados do usuário:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar dados do usuário'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar dados do usuário'
    }, { status: 500 });
  }
}
