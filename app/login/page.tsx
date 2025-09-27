'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      if (response.ok) {
        setCodeSent(true);
        setStep('code');
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Erro",
          description: errorData.error || 'Erro ao enviar código. Tente novamente.'
        });
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: 'Não foi possível conectar ao servidor. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    
    try {
      // Garantir que o JSON enviado seja válido
      const requestData = {
        email: email,
        code: code
      };
      
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        // Armazenar informações mínimas no localStorage
        localStorage.setItem('user_email', email);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authTimestamp', Date.now().toString());
        
        try {
          // Para respostas de sucesso, pegar os dados
          const responseText = await response.text();
          console.log('Resposta da API de login:', responseText);
          
          try {
            const data = JSON.parse(responseText);
            if (data && data.user) {
              localStorage.setItem('userId', data.user.id);
            }
            
            // Salvando o token diretamente no localStorage como solução alternativa
            if (data && data.token) {
              localStorage.setItem('auth-token', data.token);
              console.log('Token JWT salvo no localStorage');
            }
          } catch (e) {
            console.warn('Erro ao parsear resposta de sucesso:', e);
          }
        } catch (e) {
          console.warn('Erro ao ler resposta de sucesso:', e);
        }
        
        // Salvando todas as informações importantes no localStorage
        localStorage.setItem('user_email', email);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authTimestamp', Date.now().toString());
        localStorage.setItem('lastLogin', new Date().toISOString());
        
        // Show success message before redirecting
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
          className: "bg-gradient-to-r from-[#00E980] to-[#00FFBB] text-white"
        });
        
        // SOLUÇÃO EXTREMA: Sobrescrever a URL ao invés de redirecionar
        window.history.pushState({}, '', '/dashboard');
        window.location.assign('/dashboard');
        
        // Como backup adicional, tentar várias formas de redirecionamento
        setTimeout(() => {
          console.log('Tentativa adicional de redirecionamento...');
          window.location.href = '/dashboard';
          
          // Última tentativa após 1 segundo
          setTimeout(() => {
            console.log('Tentativa final de redirecionamento...');
            document.location.replace('/dashboard');
          }, 1000);
        }, 500);
      } else {
        // Para respostas de erro, precisamos ler o corpo
        const errorText = await response.text();
        let errorMessage = 'Código inválido ou expirado. Tente novamente.';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error('Erro ao analisar resposta de erro:', e);
        }
        
        toast({
          variant: "destructive",
          title: "Erro de verificação",
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        variant: "destructive",
        title: "Erro de verificação",
        description: 'Erro ao verificar código. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      if (response.ok) {
        setCodeSent(true);
        toast({
          title: "Código enviado!",
          description: "Verifique seu email para o novo código."
        });
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Erro",
          description: errorData.error || 'Erro ao reenviar código. Tente novamente.'
        });
      }
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: 'Não foi possível conectar ao servidor. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#015061] via-[#007A7F] to-[#00E980] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300FFBB' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Image 
                src="https://public-images-b573dd662d7c89a635d85c00405f50b1.s3.us-east-1.amazonaws.com/logos/IMG_6066.PNG"
                alt="Aurora Logo"
                className="w-16 h-16 object-contain shadow-lg rounded-2xl bg-white p-2"
                width={64}
                height={64}
              />
              <div className="absolute -inset-1 bg-gradient-to-br from-[#00E980] to-[#00FFBB] rounded-2xl blur opacity-25"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#015061] to-[#007A7F] bg-clip-text text-transparent">
              AURORA
            </h1>
            <p className="text-sm text-[#007A7F] font-medium tracking-wide uppercase">
              Inteligência Financeira
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {step === 'email' ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Acesse sua conta</h2>
                <p className="text-gray-600 text-sm">
                  Digite seu email para receber o código de acesso
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#00E980] focus:ring-[#00E980] transition-colors"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-gradient-to-r from-[#00E980] to-[#00FFBB] hover:from-[#00E980]/90 hover:to-[#00FFBB]/90 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando código...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Enviar código</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <Shield className="w-4 h-4 text-[#00E980]" />
                <span>Seus dados estão protegidos com criptografia de ponta a ponta</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00E980] to-[#00FFBB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Código enviado!</h2>
                <p className="text-gray-600 text-sm">
                  Enviamos um código de 6 dígitos para<br />
                  <span className="font-medium text-[#015061]">{email}</span>
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Código de verificação</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl font-mono tracking-widest h-14 border-gray-200 focus:border-[#00E980] focus:ring-[#00E980] transition-colors"
                    maxLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-[#00E980] to-[#00FFBB] hover:from-[#00E980]/90 hover:to-[#00FFBB]/90 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Acessar Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">Não recebeu o código?</p>
                <Button
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-[#00E980] hover:text-[#00E980]/80 hover:bg-[#00E980]/5 font-medium"
                >
                  Reenviar código
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep('email');
                    setCode('');
                    setCodeSent(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Voltar para email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#00FFBB]/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#00E980]/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 bg-[#015061]/20 rounded-full blur-xl animate-pulse delay-500"></div>
    </div>
  );
}