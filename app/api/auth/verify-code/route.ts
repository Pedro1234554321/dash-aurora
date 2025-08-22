import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aurora-finance-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email e código são obrigatórios' }, { status: 400 });
    }

    // Buscar usuário e código válido
    const result = await pool.query(`
      SELECT u.id, u.nome, u.email, u.telefone, u.status, u."gestorId", 
             c.id as code_id, c.code, c.expire_at, c.used
      FROM usuarios u
      JOIN tb_login_code c ON u.id = c.id_usuario
      WHERE u.email = $1
        AND c.code = $2
        AND c.used = FALSE
        AND c.expire_at > NOW()
      ORDER BY c.created_at DESC
      LIMIT 1
    `, [email]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 });
    }

    const user = result.rows[0];

    // Verificar se usuário está ativo
    if (!user.status) {
      return NextResponse.json({ error: 'Usuário inativo. Entre em contato com o administrador.' }, { status: 403 });
    }

    // Verificar código
    if (code !== user.code) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    // Marcar código como usado
    await pool.query('UPDATE tb_login_code SET used = TRUE WHERE id = $1', [user.code_id]);

    // Gerar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        nome: user.nome,
        telefone: user.telefone,
        gestorId: user.gestorId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Criar resposta com cookie
    const response = NextResponse.json({
      message: 'Login realizado com sucesso',
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        gestorId: user.gestorId
      }
    });

    // Definir cookie httpOnly
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 dias
    });

    return response;

  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}