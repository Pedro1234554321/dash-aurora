import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Verificar se usuário existe, se não, criar
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    let userId;
    if (userCheck.rows.length === 0) {
      // Criar novo usuário
      const newUser = await pool.query(
        'INSERT INTO users (email, created_at) VALUES ($1, NOW()) RETURNING id',
        [email]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = userCheck.rows[0].id;
    }

    // Salvar código no banco
    await pool.query(
      `INSERT INTO verification_codes (user_id, code, expires_at, created_at) 
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()`,
      [userId, hashedCode, expiresAt]
    );

    // Enviar para o webhook externo
    const webhookResponse = await fetch('https://finance-n8n.yyn81m.easypanel.host/webhook/397f9cd0-eaad-4caf-8302-2f63c6e21859', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code // Enviar código não hasheado para o webhook
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