import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: Listar todos os lembretes do usuário
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro de autenticação
    }
    
    const userId = sessionResult.userId;
    console.log(`Buscando lembretes para o usuário ID: ${userId}`);
    
    try {
      const query = `
        SELECT 
          id, 
          usuario_id, 
          titulo, 
          descricao, 
          data_lembrete, 
          enviado, 
          criado_em, 
          recorrente_tipo, 
          recorrente_ativo,
          hour
        FROM lembretes
        WHERE usuario_id = $1
        ORDER BY data_lembrete DESC, hour ASC
      `;

      const result = await pool.query(query, [userId]);
      
      console.log(`Encontrados ${result.rowCount} lembretes para o usuário`);

      return NextResponse.json({
        success: true,
        data: result.rows
      });
    } catch (dbError) {
      console.error('Erro ao consultar lembretes:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar lembretes'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de lembretes:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}

// POST: Criar um novo lembrete
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
      if (!requestData.titulo || !requestData.data_lembrete) {
        return NextResponse.json({
          success: false,
          error: 'Título e data do lembrete são obrigatórios'
        }, { status: 400 });
      }
      
      // Garantir que hour esteja entre 0 e 23
      const hour = requestData.hour !== undefined ? parseInt(requestData.hour) : 12;
      if (isNaN(hour) || hour < 0 || hour > 23) {
        return NextResponse.json({
          success: false,
          error: 'A hora deve ser um número entre 0 e 23'
        }, { status: 400 });
      }

      const query = `
        INSERT INTO lembretes (
          usuario_id, 
          titulo, 
          descricao, 
          data_lembrete, 
          recorrente_tipo, 
          recorrente_ativo,
          hour
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [
        userId,
        requestData.titulo,
        requestData.descricao || null,
        requestData.data_lembrete,
        requestData.recorrente_tipo || null,
        requestData.recorrente_ativo || false,
        hour
      ];

      const result = await pool.query(query, values);
      
      console.log('Novo lembrete criado com sucesso');

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      }, { status: 201 });
    } catch (dbError) {
      console.error('Erro ao criar lembrete:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar lembrete'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de criação de lembrete:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}

// PUT: Atualizar um lembrete existente
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
      if (!requestData.id || !requestData.titulo || !requestData.data_lembrete) {
        return NextResponse.json({
          success: false,
          error: 'ID, título e data do lembrete são obrigatórios'
        }, { status: 400 });
      }

      // Garantir que hour esteja entre 0 e 23
      const hour = requestData.hour !== undefined ? parseInt(requestData.hour) : 12;
      if (isNaN(hour) || hour < 0 || hour > 23) {
        return NextResponse.json({
          success: false,
          error: 'A hora deve ser um número entre 0 e 23'
        }, { status: 400 });
      }
      
      // Verificar se o lembrete pertence ao usuário
      const checkQuery = `
        SELECT id FROM lembretes 
        WHERE id = $1 AND usuario_id = $2
      `;
      
      const checkResult = await pool.query(checkQuery, [requestData.id, userId]);
      
      if (checkResult.rowCount === 0) {
        return NextResponse.json({
          success: false,
          error: 'Lembrete não encontrado ou você não tem permissão para editá-lo'
        }, { status: 403 });
      }

      const query = `
        UPDATE lembretes 
        SET 
          titulo = $1, 
          descricao = $2, 
          data_lembrete = $3, 
          recorrente_tipo = $4, 
          recorrente_ativo = $5,
          hour = $6,
          enviado = $7
        WHERE id = $8 AND usuario_id = $9
        RETURNING *
      `;

      const values = [
        requestData.titulo,
        requestData.descricao || null,
        requestData.data_lembrete,
        requestData.recorrente_tipo || null,
        requestData.recorrente_ativo || false,
        hour,
        requestData.enviado !== undefined ? requestData.enviado : false,
        requestData.id,
        userId
      ];

      const result = await pool.query(query, values);
      
      console.log('Lembrete atualizado com sucesso');

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });
    } catch (dbError) {
      console.error('Erro ao atualizar lembrete:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao atualizar lembrete'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de atualização de lembrete:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}

// DELETE: Remover um lembrete
export async function DELETE(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    if ('status' in sessionResult) {
      return sessionResult; // Retorna a resposta de erro de autenticação
    }
    
    const userId = sessionResult.userId;
    const { searchParams } = new URL(request.url);
    const lembreteId = searchParams.get('id');
    
    if (!lembreteId) {
      return NextResponse.json({
        success: false,
        error: 'ID do lembrete é obrigatório'
      }, { status: 400 });
    }
    
    try {
      // Verificar se o lembrete pertence ao usuário
      const checkQuery = `
        SELECT id FROM lembretes 
        WHERE id = $1 AND usuario_id = $2
      `;
      
      const checkResult = await pool.query(checkQuery, [lembreteId, userId]);
      
      if (checkResult.rowCount === 0) {
        return NextResponse.json({
          success: false,
          error: 'Lembrete não encontrado ou você não tem permissão para removê-lo'
        }, { status: 403 });
      }

      const query = `
        DELETE FROM lembretes 
        WHERE id = $1 AND usuario_id = $2
        RETURNING id
      `;

      const result = await pool.query(query, [lembreteId, userId]);
      
      console.log('Lembrete removido com sucesso');

      return NextResponse.json({
        success: true,
        data: { id: result.rows[0].id }
      });
    } catch (dbError) {
      console.error('Erro ao remover lembrete:', dbError);
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao remover lembrete'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Erro ao processar requisição de remoção de lembrete:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}
