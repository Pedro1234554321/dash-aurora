import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: Listar todas as categorias do usuário
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro de autenticação
    }
    
    const userId = sessionResult.userId;
    console.log(`Buscando categorias para o usuário ID: ${userId}`);
    
    try {
      const query = `
        SELECT 
          id, 
          usuario_id, 
          nome, 
          tipo
        FROM categorias
        WHERE usuario_id = $1
        ORDER BY nome ASC
      `;

      const result = await pool.query(query, [userId]);
      
      console.log(`Encontradas ${result.rowCount} categorias para o usuário`);

      return NextResponse.json({
        success: true,
        data: result.rows
      });
    } catch (dbError) {
      console.error('Erro ao consultar categorias:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar categorias'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de categorias:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}

// POST: Criar uma nova categoria
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro de autenticação
    }
    
    const userId = sessionResult.userId;
    
    try {
      const requestData = await request.json();
      
      // Validação dos campos obrigatórios
      if (!requestData.nome) {
        return NextResponse.json({
          success: false,
          error: 'Nome da categoria é obrigatório'
        }, { status: 400 });
      }
      
      // Validação do tipo da categoria (se fornecido)
      if (requestData.tipo && !['essencial', 'futil', 'investimento'].includes(requestData.tipo)) {
        return NextResponse.json({
          success: false,
          error: 'Tipo de categoria deve ser: essencial, futil ou investimento'
        }, { status: 400 });
      }

      const query = `
        INSERT INTO categorias (
          usuario_id, 
          nome, 
          tipo
        ) VALUES ($1, $2, $3)
        RETURNING *
      `;

      const values = [
        userId,
        requestData.nome,
        requestData.tipo || null
      ];

      const result = await pool.query(query, values);
      
      console.log('Nova categoria criada com sucesso');

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      }, { status: 201 });
    } catch (dbError) {
      console.error('Erro ao criar categoria:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar categoria'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de criação de categoria:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}

// PUT: Atualizar uma categoria existente
export async function PUT(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro de autenticação
    }
    
    const userId = sessionResult.userId;
    
    try {
      const requestData = await request.json();
      
      // Validação dos campos obrigatórios
      if (!requestData.id || !requestData.nome) {
        return NextResponse.json({
          success: false,
          error: 'ID e nome da categoria são obrigatórios'
        }, { status: 400 });
      }

      // Validação do tipo da categoria (se fornecido)
      if (requestData.tipo && !['essencial', 'futil', 'investimento'].includes(requestData.tipo)) {
        return NextResponse.json({
          success: false,
          error: 'Tipo de categoria deve ser: essencial, futil ou investimento'
        }, { status: 400 });
      }
      
      // Verificar se a categoria pertence ao usuário
      const checkQuery = `
        SELECT id FROM categorias 
        WHERE id = $1 AND usuario_id = $2
      `;
      
      const checkResult = await pool.query(checkQuery, [requestData.id, userId]);
      
      if (checkResult.rowCount === 0) {
        return NextResponse.json({
          success: false,
          error: 'Categoria não encontrada ou você não tem permissão para editá-la'
        }, { status: 403 });
      }

      const query = `
        UPDATE categorias 
        SET 
          nome = $1, 
          tipo = $2
        WHERE id = $3 AND usuario_id = $4
        RETURNING *
      `;

      const values = [
        requestData.nome,
        requestData.tipo || null,
        requestData.id,
        userId
      ];

      const result = await pool.query(query, values);
      
      console.log('Categoria atualizada com sucesso');

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });
    } catch (dbError) {
      console.error('Erro ao atualizar categoria:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao atualizar categoria'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de atualização de categoria:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}

// DELETE: Remover uma categoria
export async function DELETE(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro de autenticação
    }
    
    const userId = sessionResult.userId;
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');
    
    if (!categoryId) {
      return NextResponse.json({
        success: false,
        error: 'ID da categoria é obrigatório'
      }, { status: 400 });
    }
    
    try {
      // Verificar se a categoria pertence ao usuário
      const checkQuery = `
        SELECT id FROM categorias 
        WHERE id = $1 AND usuario_id = $2
      `;
      
      const checkResult = await pool.query(checkQuery, [categoryId, userId]);
      
      if (checkResult.rowCount === 0) {
        return NextResponse.json({
          success: false,
          error: 'Categoria não encontrada ou você não tem permissão para removê-la'
        }, { status: 403 });
      }

      // Verificar se existem transações usando esta categoria
      const transactionsCheckQuery = `
        SELECT COUNT(*) FROM transacoes 
        WHERE categoria_id = $1
      `;
      
      const transactionsCheck = await pool.query(transactionsCheckQuery, [categoryId]);
      const transactionCount = parseInt(transactionsCheck.rows[0].count || '0');
      
      if (transactionCount > 0) {
        return NextResponse.json({
          success: false,
          error: `Esta categoria não pode ser removida pois está sendo usada em ${transactionCount} transação(ões)`,
          transactionCount
        }, { status: 400 });
      }

      const query = `
        DELETE FROM categorias 
        WHERE id = $1 AND usuario_id = $2
        RETURNING id
      `;

      const result = await pool.query(query, [categoryId, userId]);
      
      console.log('Categoria removida com sucesso');

      return NextResponse.json({
        success: true,
        data: { id: result.rows[0].id }
      });
    } catch (dbError) {
      console.error('Erro ao remover categoria:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao remover categoria'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de remoção de categoria:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}
