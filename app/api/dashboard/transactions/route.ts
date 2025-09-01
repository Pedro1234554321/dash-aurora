import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UserSession } from '@/lib/auth';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult;
    }
    
    const session: UserSession = sessionResult;
    const userId = session.userId;

    console.log(userId)

    const url = new URL(request.url);
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const searchText = searchParams.get('search');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');
    
    console.log('Filtros solicitados:', {
      month,
      searchText: searchText || 'nenhum',
      dateStart: dateStart || 'nenhuma',
      dateEnd: dateEnd || 'nenhuma'
    });
    
    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    try {
      // Verificando a estrutura da tabela primeiro
      console.log('Verificando estrutura da tabela transacoes');
      const tableInfo = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'transacoes'
      `);
      
      console.log('Colunas disponíveis:', tableInfo.rows.map(r => r.column_name));
      
      // Construir cláusulas WHERE para filtros
      let filterClauses = [];
      let queryParams = [userId];
      let paramIndex = 2; // Começando do $2 pois $1 é o userId
      
      // Filtro de mês (YYYY-MM) - apenas se não houver filtro de data específica
      if (month && !dateStart && !dateEnd) {
        filterClauses.push(`TO_CHAR(data, 'YYYY-MM') = $${paramIndex}`);
        queryParams.push(month);
        paramIndex++;
        console.log('Aplicando filtro de mês:', month);
      }
      
      // Filtro de busca por texto (descrição)
      if (searchText) {
        filterClauses.push(`LOWER(descricao) LIKE LOWER($${paramIndex})`);
        queryParams.push(`%${searchText}%`); // Busca parcial
        paramIndex++;
        console.log('Aplicando filtro de busca:', searchText);
      }
      
      // Filtro de data inicial (data de pagamento)
      if (dateStart) {
        // Usando DATE(data_pagamento) para ignorar o componente de hora
        filterClauses.push(`DATE(data_pagamento) >= $${paramIndex}::date`);
        queryParams.push(dateStart);
        paramIndex++;
        console.log('Aplicando filtro de data inicial em data_pagamento:', dateStart);
      }
      
      // Filtro de data final (data de pagamento)
      if (dateEnd) {
        // Usando DATE(data_pagamento) para ignorar o componente de hora
        filterClauses.push(`DATE(data_pagamento) <= $${paramIndex}::date`);
        queryParams.push(dateEnd);
        paramIndex++;
        console.log('Aplicando filtro de data final em data_pagamento:', dateEnd);
      }
      
      // Construir a cláusula WHERE completa
      const whereClause = filterClauses.length > 0 ? 
        `AND ${filterClauses.join(' AND ')}` : 
        '';
      
      // Consulta para contar total de registros (para paginação) com filtros aplicados
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM transacoes WHERE usuario_id = $1 ${whereClause}`,
        queryParams
      );
      
      console.log('Total de transações encontradas para o mês:', countResult.rows[0].total);
      
      const totalRecords = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalRecords / limit);
      
      // Ajustando a consulta para usar paginação e filtro de mês
      const selectQueryParams = [...queryParams, limit, offset];
      const paramIndexOffset = queryParams.length;
      
      const result = await pool.query(
        `SELECT 
          id,
          data as date,
          descricao as description,
          categoria_id,
          tipo as type,
          valor as amount
        FROM transacoes 
        WHERE usuario_id = $1 
        ${whereClause}
        ORDER BY data DESC 
        LIMIT $${paramIndexOffset + 1} OFFSET $${paramIndexOffset + 2}`,
        selectQueryParams
      );
      
      console.log(`Consulta executada com ${result.rowCount} resultados, filtro: ${month || 'nenhum'}`);

      console.log(result.rows)
      
      const transformedRows = await Promise.all(result.rows.map(async (row) => {
        try {
          const catResult = await pool.query(
            `SELECT nome FROM categorias WHERE id = $1`,
            [row.categoria_id]
          );
          
          return {
            ...row,
            category: catResult.rows[0]?.nome || 'Categoria Indefinida'
          };
        } catch (error) {
          console.error('Erro ao buscar nome da categoria:', error);
          return {
            ...row,
            category: 'Categoria Indefinida'
          };
        }
      }));
      
      // Incluir metadados de paginação na resposta
      return NextResponse.json({
        success: true,
        data: transformedRows,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages
        }
      });
      
    } catch (dbError) {
      console.log('Erro ao buscar do banco, usando dados simulados:', dbError);
      return NextResponse.json({
        success: true,
        data: [],
        simulated: true,
        pagination: {
          page,
          limit,
          totalRecords: 0,
          totalPages: 0
        }
      });
    }
    
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 }
    );
  }
}
