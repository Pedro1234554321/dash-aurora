import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware executado para:', pathname);
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/login', 
    '/api/auth/send-code', 
    '/api/auth/verify-code', 
    '/_next', 
    '/favicon.ico'
  ];
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/';
  if (isPublicRoute) {
    console.log('Rota pública permitida:', pathname);
    return NextResponse.next();
  }

  // Adiciona /api/dashboard às rotas protegidas
  if (pathname.startsWith('/api/dashboard')) {
    // Para APIs do dashboard, apenas verifica a presença do token (sem validar no middleware)
    const token = request.cookies.get('auth-token')?.value;
    console.log('Token para rota de API:', pathname, token ? 'presente' : 'ausente');
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado', message: 'Token ausente' }, { status: 401 });
    }
    
    // A verificação completa será feita na rota da API (ambiente Node.js completo)
    console.log('Token presente para API, validação será feita na rota');
    return NextResponse.next();
  }

  // Para rotas de páginas (não APIs)
  // Verificar token de autenticação
  const token = request.cookies.get('auth-token')?.value;
  const authStatus = request.cookies.get('auth-status')?.value;
  
  console.log('Verificando acesso a página:', pathname);
  console.log('Cookies presentes:', 
    'auth-token =', token ? 'presente' : 'ausente',
    'auth-status =', authStatus ? 'presente' : 'ausente'
  );

  // Se algum dos cookies estiver presente, permitir acesso
  // A verificação definitiva será feita no nível da página com localStorage
  if (token || authStatus === 'authenticated') {
    console.log('Acesso permitido via cookie');
    return NextResponse.next();
  }
  
  console.log('Redirecionando para login (sem cookie)');
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};