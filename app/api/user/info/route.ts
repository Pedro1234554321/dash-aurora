import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UserSession } from '@/lib/auth';

// Força o uso do runtime Node.js completo (não o Edge Runtime)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionResult = await requireAuth(request);
    
    // Check if it's an error response (not a UserSession)
    if ('status' in sessionResult) {
      return sessionResult; // Return the error response
    }
    
    // Agora temos acesso à sessão do usuário
    const session: UserSession = sessionResult;
    
    // Retorna apenas os dados que queremos mostrar no dashboard
    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        name: session.nome,
        email: session.email,
        phone: session.telefone || 'Não informado',
        managerId: session.gestorId
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar informações do usuário',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
