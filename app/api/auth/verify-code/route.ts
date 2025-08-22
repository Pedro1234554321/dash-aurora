import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aurora-finance-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email e código são obrigatórios' }, { status: 400 });
    }

    // Buscar usuário e código
    const result = await pool.query(`
      SELECT u.id, u.email, vc.code, vc.expires_at
      FROM users u
      JOIN verification_codes vc ON u.id = vc.user_id
      WHERE u.email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 });
    }

    const user = result.rows[0];

    // Verificar se código não expirou
    if (new Date() > new Date(user.expires_at)) {
      return NextResponse.json({ error: 'Código expirado' }, { status: 400 });
    }

    // Verificar código
    const isValidCode = await bcrypt.compare(code, user.code);
    if (!isValidCode) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    // Remover código usado
    await pool.query('DELETE FROM verification_codes WHERE user_id = $1', [user.id]);

    // Atualizar último login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Gerar JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Criar resposta com cookie
    const response = NextResponse.json({
      message: 'Login realizado com sucesso',
      success: true,
      user: {
        id: user.id,
        email: user.email
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