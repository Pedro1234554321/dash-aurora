import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { Pool } from 'pg';

// Força o uso do runtime Node.js completo (não o Edge Runtime)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Configuração da conexão com o banco de dados PostgreSQL
let pool: Pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} catch (error) {
  console.error('Erro ao criar pool de conexão com o PostgreSQL:', error);
}

// Dados simulados para quando o banco de dados não estiver disponível
const mockUserOverviewData = [
  {
    id: "79f97a21-fb31-473b-a482-1f3b091a0d6d",
    nome: "Allan",
    email: "allan@zscan.com",
    totalEntradas: 3500.00,
    totalDespesas: 3500.00,
    saldo: 0.00
  },
  {
    id: "0c4ae822-c7e0-4f3e-ba8e-974d7c55bea2",
    nome: "Ricael Pereira Lopes",
    email: "ricael.vide@gmail.com",
    totalEntradas: 0.00,
    totalDespesas: 0.00,
    saldo: 0.00
  },
  {
    id: "b0893c3b-19d1-4a0b-a99d-2e7a5a33b4c9",
    nome: "Wesley Vieira Santos",
    email: "joaozinhopegar23cm123@gmail.com",
    totalEntradas: 4110.00,
    totalDespesas: 512.99,
    saldo: 3597.01
  },
  {
    id: "4a08137e-415e-41c1-bd3a-7156630aee6d",
    nome: "Pedro Paulo Cardoso Ferreira",
    email: "pedropaulo@gmail.com",
    totalEntradas: 0.00,
    totalDespesas: 170.01,
    saldo: -170.01
  },
  {
    id: "ce2db001-db45-4782-ac20-7528d5dc7f3e",
    nome: "Carlos Ferreira",
    email: "carlos.ferreira.consulting@gmail.com",
    totalEntradas: 0.00,
    totalDespesas: 15150.67,
    saldo: -15150.67
  },
  {
    id: "0503e7e4-5753-494b-9288-2349eba55c87",
    nome: "Guilherme Bezerra dos Santos",
    email: "guilherme.bezerradoctor@gmail.com",
    totalEntradas: 0.00,
    totalDespesas: 559.79,
    saldo: -559.79
  }
];

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    // Verificar se é uma resposta de erro (não é uma sessão de usuário)
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro
    }
    
    // Agora temos acesso à sessão do usuário
    const userId = sessionResult.userId;
    console.log('Buscando visão geral dos usuários para o admin:', userId);

    // Verificar se o pool do banco de dados está disponível
    if (!pool) {
      console.log('Banco de dados não disponível. Usando dados simulados.');
      return NextResponse.json({
        success: true,
        data: mockUserOverviewData,
        mock: true
      });
    }

    try {
      // Consulta SQL para buscar os dados da view
      const query = `
        SELECT 
          usuario_id, 
          usuario_nome, 
          usuario_email, 
          total_entradas, 
          total_despesas, 
          saldo
        FROM vw_entrada_vs_despesa
        ORDER BY usuario_nome
      `;

      const result = await pool.query(query);
      
      console.log(`Encontrados ${result.rowCount} usuários na visão geral`);

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
      console.log('Usando dados simulados como fallback.');
      
      return NextResponse.json({
        success: true,
        data: mockUserOverviewData,
        mock: true
      });
    }
    
  } catch (error) {
    console.error('Erro ao buscar visão geral dos usuários:', error);
    
    // Em caso de qualquer erro, retornar dados simulados
    return NextResponse.json({
      success: true,
      data: mockUserOverviewData,
      mock: true,
      error: String(error)
    });
  }
}
