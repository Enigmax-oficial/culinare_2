import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, ChefHat, User as UserIcon, Mail, Loader2, ArrowRight, AlertCircle, Key } from 'lucide-react';
import { authService } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

export const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleGoogleResponse = async (response) => {
      setLoading(true);
      setError('');
      try {
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

    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: '415793717407-mystical-app-486213-p4.apps.googleusercontent.com', 
        callback: handleGoogleResponse
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 320
      });
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Informe seu nome.');
        const user = await authService.createUser(name, email, 'email');
        onLoginSuccess(user);
      } else {
        const user = await authService.login(email, password);
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('Credenciais inválidas ou conta não encontrada.');
        }
      }
    } catch (err) {
      setError(err.message || String(err));
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
          </div>

          <div className="space-y-6 flex flex-col items-center">
            <div ref={googleButtonRef} className="w-full flex justify-center min-h-[50px]" />

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

              <div className="group relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={t('password')}
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
                    <span>{isRegister ? 'Criar Perfil' : t('login')}</span>
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
              {isRegister ? 'Já tem conta? Login' : 'Novo? Criar perfil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
