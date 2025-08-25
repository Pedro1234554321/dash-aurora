import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'aurora-finance-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Verificar se o corpo da requisição existe antes de fazer parse
    const bodyText = await request.text();
    if (!bodyText) {
      return NextResponse.json({ error: 'Corpo da requisição vazio' }, { status: 400 });
    }
    
    // Tentar fazer parse do JSON
    let requestData;
    try {
      requestData = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json({ error: 'JSON inválido no corpo da requisição' }, { status: 400 });
    }
    
    const { email, code } = requestData;

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
    `, [email, code]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 });
    }

    const user = result.rows[0];
    
    console.log('Detalhes do código:', { 
      receivedCode: code, 
      dbCode: user.code,
      receivedType: typeof code,
      dbType: typeof user.code,
      matches: code == user.code  // Usando comparação menos estrita
    });
    
    // Removendo a comparação adicional, já que a query SQL já verificou o código
    // A query já filtrou por code = $2, então não precisa verificar novamente
    // if (code !== user.code) {
    //  return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    // }

    await pool.query(
      'UPDATE tb_login_code SET used = TRUE WHERE id = $1',
      [user.code_id]
    );

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

    console.log('Gerando token JWT para o usuário:', user.id);

    // Criar resposta com dados simplificados
    const responseData = {
      message: 'Login realizado com sucesso',
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    };

    console.log('Criando resposta com dados:', responseData);
    const response = NextResponse.json(responseData);
    
    try {
      console.log('Definindo cookie auth-token');
      // Configurar o token como cookie e incluir ele no corpo da resposta também
      response.cookies.set('auth-token', token, {
        httpOnly: true,  // Não acessível via JavaScript
        secure: false,    // Alterar para true em produção
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 dias
      });
      
      // Modificar o body da resposta para incluir o token
      const updatedResponseData = { ...responseData, token };
      const newResponse = NextResponse.json(updatedResponseData);
      
      // Transferir os cookies para a nova resposta
      newResponse.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      });
      
      // Cookie adicional não httpOnly para verificar status de autenticação
      newResponse.cookies.set('auth-status', 'authenticated', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 dias
      });
      
      console.log('Cookies definidos com sucesso, retornando nova resposta com token');
      return newResponse;
    } catch (err) {
      console.error('Erro ao definir cookies:', err);
    }

    return response;

  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}