import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

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

    const userId = userCheck.rows[0].id;

    // Salvar código no banco
    await pool.query(
      `INSERT INTO tb_login_code (id_usuario, code, expire_at, used) 
       VALUES ($1, $2, $3, FALSE)`,
      [userId, code, expireAt]
    );

    // Enviar para o webhook externo
    const webhookResponse = await fetch('https://finance-n8n.yyn81m.easypanel.host/webhook/397f9cd0-eaad-4caf-8302-2f63c6e21859', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code
      })
    });

    if (!webhookResponse.ok) {
      console.error('Erro ao enviar para webhook:', webhookResponse.statusText);
    }

    return NextResponse.json({ 
      message: 'Código enviado com sucesso',
      success: true 
    });

  } catch (error) {
    console.error('Erro ao enviar código:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}