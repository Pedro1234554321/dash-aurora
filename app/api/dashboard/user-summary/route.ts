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

// Dados fixos para quando o banco de dados não está disponível (APENAS PARA DESENVOLVIMENTO)
const getFixedUserData = () => {
  return {
    id: "7948b191-e568-4eb9-92a2-67bf5583d007",
    nome: "Wesley Santos",
    email: "telhado.folha@gmail.com",
    totalEntradas: 4183.00,
    totalDespesas: 5823.31,
    saldo: -1640.31
  };
};

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    // Verificar se é uma resposta de erro (não é uma sessão de usuário)
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro
    }
    
    // Agora temos acesso à sessão do usuário
    const userId = sessionResult.userId;
    console.log('Buscando resumo financeiro do usuário:', userId);

    // Verificar se o pool do banco de dados está disponível
    if (!pool) {
      console.warn('Banco de dados não disponível. Usando dados fixos do Wesley.');
      const fixedData = getFixedUserData();
      return NextResponse.json({
        success: true,
        data: fixedData,
        isFixed: true
      });
    }

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
          success: true,
          data: {
            id: userId,
            nome: "Usuário",
            email: "email@exemplo.com",
            totalEntradas: 0,
            totalDespesas: 0,
            saldo: 0
          }
        });
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
      console.warn('Erro ao consultar o banco de dados:', dbError);
      console.log('Usando dados fixos do Wesley como fallback.');
      const fixedData = getFixedUserData();
      return NextResponse.json({
        success: true,
        data: fixedData,
        isFixed: true
      });
    }
    
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    
    // Em caso de erro geral, usar dados fixos como fallback
    console.warn('Erro geral ao processar requisição:', error);
    console.log('Usando dados fixos do Wesley como último recurso.');
    const fixedData = getFixedUserData();
    return NextResponse.json({
      success: true,
      data: fixedData,
      isFixed: true
    });
  }
}
