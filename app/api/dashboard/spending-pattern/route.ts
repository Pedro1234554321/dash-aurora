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
const mockSpendingPatternData = [
  {
    periodo_mes: 'inicio',
    total_gasto: 1250.75,
    media_por_transacao: 250.15,
    period: 'inicio',
    totalSpent: 1250.75,
    averagePerTransaction: 250.15
  },
  {
    periodo_mes: 'meio',
    total_gasto: 2340.50,
    media_por_transacao: 335.78,
    period: 'meio',
    totalSpent: 2340.50,
    averagePerTransaction: 335.78
  },
  {
    periodo_mes: 'fim',
    total_gasto: 1878.25,
    media_por_transacao: 312.30,
    period: 'fim',
    totalSpent: 1878.25,
    averagePerTransaction: 312.30
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
    console.log('Buscando padrão de gastos por período para o usuário:', userId);

    // Verificar se o pool do banco de dados está disponível
    if (!pool) {
      console.log('Banco de dados não disponível. Usando dados simulados.');
      return NextResponse.json({
        success: true,
        data: mockSpendingPatternData,
        mock: true
      });
    }

    try {
      // Consulta SQL para buscar os dados da tabela padrao_gasto_periodo_mes
      const query = `
        SELECT 
          periodo_mes,
          total_gasto,
          media_por_transacao
        FROM padrao_gasto_periodo_mes 
        WHERE usuario_id = $1
        ORDER BY 
          CASE periodo_mes
            WHEN 'inicio' THEN 1
            WHEN 'meio' THEN 2
            WHEN 'fim' THEN 3
            ELSE 4
          END
      `;

      const result = await pool.query(query, [userId]);
      
      console.log(`Encontrados ${result.rowCount} registros de padrão de gastos`);

      // Mapear os resultados para incluir tanto os nomes em português quanto em inglês
      // para manter compatibilidade com componentes existentes
      const mappedData = result.rows.map(row => ({
        periodo_mes: row.periodo_mes,
        total_gasto: parseFloat(row.total_gasto) || 0,
        media_por_transacao: parseFloat(row.media_por_transacao) || 0,
        // Versões em inglês dos campos
        period: row.periodo_mes,
        totalSpent: parseFloat(row.total_gasto) || 0,
        averagePerTransaction: parseFloat(row.media_por_transacao) || 0
      }));

      return NextResponse.json({
        success: true,
        data: mappedData
      });
    } catch (dbError) {
      console.error('Erro ao consultar o banco de dados:', dbError);
      console.log('Usando dados simulados como fallback.');
      
      return NextResponse.json({
        success: true,
        data: mockSpendingPatternData,
        mock: true
      });
    }
    
  } catch (error) {
    console.error('Erro ao buscar padrão de gastos por período:', error);
    
    // Em caso de qualquer erro, retornar dados simulados
    return NextResponse.json({
      success: true,
      data: mockSpendingPatternData,
      mock: true,
      error: String(error)
    });
  }
}
