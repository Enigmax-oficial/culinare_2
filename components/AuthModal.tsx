import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, ChefHat, User as UserIcon, Mail, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGoogleResponse = async (response: any) => {
      setLoading(true);
      setError('');
      try {
        // Decode logic from the original JS file provided
        const base64Url = response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64Url).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const { email: googleEmail, name: googleName } = JSON.parse(jsonPayload);

        let user = await authService.login(googleEmail);
        if (!user) {
          user = await authService.createUser(googleName || 'Chef Gourmet', googleEmail, 'google');
        }
        onLoginSuccess(user);
      } catch (err) {
        setError('Erro ao autenticar com Google. Tente via e-mail.');
      } finally {
        setLoading(false);
      }
    };

    if ((window as any).google && googleButtonRef.current) {
      (window as any).google.accounts.id.initialize({
        client_id: '415793717407-mystical-app-486213-p4.apps.googleusercontent.com', // ID from the prompt's JS
        callback: handleGoogleResponse
      });
      (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 320
      });
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Informe seu nome.');
        const user = await authService.createUser(name, email, 'email');
        onLoginSuccess(user);
      } else {
        const user = await authService.login(email);
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('Conta não encontrada. Cadastre-se!');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 p-2 text-stone-300 hover:text-stone-900 transition-colors z-20"
        >
          <X size={24} />
        </button>

        <div className="p-8 sm:p-12 pb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-orange-50 text-orange-600 mb-6">
              <ChefHat size={36} />
            </div>
            <h2 className="text-3xl font-black text-stone-900 mb-2">Acesso Seguro</h2>
            <p className="text-stone-400 text-sm font-medium">Seus dados são armazenados localmente.</p>
          </div>

          <div className="space-y-6 flex flex-col items-center">
            {/* Google Button Container */}
            <div ref={googleButtonRef} className="w-full flex justify-center min-h-[50px]" />

            {/* Mock Apple Button to match Screenshot/JS */}
            <button type="button" className="w-full max-w-[320px] flex items-center justify-center gap-3 py-4 bg-stone-900 rounded-full hover:bg-black transition-all font-black text-xs text-white shadow-xl active:scale-95">
               <svg width="20" height="20" viewBox="0 0 384 512" fill="currentColor" className="flex-shrink-0"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
               <span>Continuar com Apple</span>
            </button>

            <div className="relative flex items-center justify-center w-full my-2">
              <div className="w-full border-t border-stone-100 absolute" />
              <span className="relative bg-white px-4 text-[9px] font-black text-stone-300 uppercase tracking-widest">
                ou e-mail
              </span>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {isRegister && (
                <div className="group relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Seu nome" 
                    className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-orange-500/20 focus:bg-white transition-all font-bold text-stone-700"
                  />
                </div>
              )}
              
              <div className="group relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="E-mail" 
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-orange-500/20 focus:bg-white transition-all font-bold text-stone-700"
                  required 
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-bold uppercase flex gap-3 items-center">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange-500 text-white font-black py-5 rounded-full flex items-center justify-center gap-3 shadow-2xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <span>{isRegister ? 'Criar Perfil' : 'Entrar'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(''); }} 
              className="text-stone-400 font-bold text-[10px] hover:text-orange-500 transition-colors uppercase tracking-widest"
            >
              {isRegister ? 'Já tem conta? Login' : 'Novo? Criar perfil local'}
            </button>
          </div>

          <div className="mt-10 pt-6 border-t border-stone-50 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
              <Lock size={12} className="text-green-500" />
              App 100% Estático
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};