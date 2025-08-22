import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // Se recebeu código, é o webhook enviando o código gerado
    if (code) {
      console.log('Webhook enviando código:', { email, code });
      
      // Verificar se usuário existe
      const userCheck = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (userCheck.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Usuário não encontrado' 
        }, { status: 404 });
      }

      const userId = userCheck.rows[0].id;
      const expireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Salvar código no banco
      await pool.query(
        `INSERT INTO tb_login_code (id_usuario, code, expire_at, used) 
         VALUES ($1, $2, $3, FALSE)`,
        [userId, code, expireAt]
      );

      return NextResponse.json({ 
        message: 'Código salvo com sucesso',
        success: true 
      });
    }

    // Se não recebeu código, é o frontend solicitando envio
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    console.log('Frontend solicitando código para:', email);

    // Verificar se usuário existe
    const userCheck = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado. Entre em contato com o administrador.' 
      }, { status: 404 });
    }

    // Enviar email para o webhook externo (sem código)
    fetch('https://finance-n8n.yyn81m.easypanel.host/webhook/397f9cd0-eaad-4caf-8302-2f63c6e21859', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
      })
    }).catch(error => {
      console.error('Erro ao enviar para webhook (não crítico):', error);
    });

    return NextResponse.json({ 
      message: 'Código enviado para seu email',
      success: true 
    });

  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}