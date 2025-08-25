import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'aurora-finance-secret-key';

export interface UserSession {
  userId: string;
  email: string;
  nome: string;
  telefone: string;
  gestorId: string | null;
}

/**
 * Verifica a sessão do usuário a partir do cookie auth-token
 */
export async function getSession(req?: NextRequest): Promise<UserSession | null> {
  try {
    let token: string | undefined;
    
    if (req) {
      // Se for fornecido um objeto de requisição, usa ele para obter o cookie
      token = req.cookies.get('auth-token')?.value;
    } else {
      // Caso contrário, usa a API de cookies do Next.js
      const cookieStore = cookies();
      token = cookieStore.get('auth-token')?.value;
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
}

/**
 * Middleware para rotas de API que requerem autenticação
 * Roda no ambiente Node.js completo (não no Edge Runtime)
 */
export async function requireAuth(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login novamente.' },
        { status: 401 }
      );
    }
    
    return session;
  } catch (error) {
    console.error('Erro na verificação de autenticação:', error);
    return NextResponse.json(
      { error: 'Erro na verificação de autenticação', details: String(error) },
      { status: 401 }
    );
  }
}
