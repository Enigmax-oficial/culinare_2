import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Download, Trash2, KeyRound, Bell, ToggleLeft, ToggleRight } from 'lucide-react';
import { authService } from '../services/authService.js';
import { notificationService } from '../services/notificationService.js';
import { useLanguage } from '../contexts/LanguageContext.js';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [user, setUser] = useState(authService.getUser());
    const [notifications, setNotifications] = useState([]);
    const [prefs, setPrefs] = useState({ recipeUpdates: true, marketing: true });

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        setNotifications(notificationService.getNotificationsForUser(user.id));
        if (user.preferences) {
            setPrefs(user.preferences);
        }
    }, [user, navigate]);

    const handleExport = () => {
        const data = JSON.stringify(localStorage);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chef_em_casa_data.json';
        a.click();
    };

    const handleDeleteAccount = () => {
        if (confirm('Are you sure? This will clear all local data.')) {
            authService.logout();
            localStorage.clear();
            navigate('/');
        }
    };

    const togglePref = (key) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        if (user) {
            const updatedUser = { ...user, preferences: newPrefs };
            authService.updateUser(updatedUser);
            setUser(updatedUser);
        }
    };

    if (!user) return null;

    return (
        <div className="px-4 py-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-8">
                <Link to="/" className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900"><ArrowLeft size={16} /></Link>
                <h1 className="text-2xl font-black text-stone-900">{t('profile_settings')}</h1>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm flex items-center gap-4">
                    {user.avatar ? (
                        <img src={user.avatar} className="w-16 h-16 rounded-full border border-stone-200" alt={user.name} />
                    ) : (
                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-2xl">{user.name.charAt(0)}</div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">{user.name}</h2>
                        <p className="text-stone-400 text-sm">{user.email}</p>
                        <span className="inline-block mt-2 bg-stone-100 text-stone-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">{user.role}</span>
                    </div>
                </div>

                <section>
                    <div className="flex items-center gap-2 mb-4"><Bell className="text-orange-500" size={20} /><h3 className="text-lg font-bold text-stone-900">{t('notifications')}</h3></div>
                    <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-wider">Histórico</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <p className="text-sm text-stone-400 italic">{t('no_notifications')}</p>
                                ) : (
                                    notifications.map(note => (
                                        <div key={note.id} className={`p-3 rounded-2xl border ${note.read ? 'bg-stone-50 border-stone-100' : 'bg-orange-50 border-orange-100'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-bold ${note.read ? 'text-stone-600' : 'text-orange-800'}`}>{note.title}</span>
                                                <span className="text-[10px] text-stone-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-stone-500">{note.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="h-px bg-stone-100 w-full" />
                        <div>
                            <h4 className="text-xs font-bold text-stone-400 mb-4 uppercase tracking-wider">{t('notification_pref')}</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-stone-700">{t('notify_recipe_updates')}</p>
                                        <p className="text-[10px] text-stone-400">Quando suas receitas forem aprovadas.</p>
                                    </div>
                                    <button onClick={() => togglePref('recipeUpdates')} className={`transition-colors ${prefs.recipeUpdates ? 'text-orange-500' : 'text-stone-300'}`}>{prefs.recipeUpdates ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}</button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-stone-700">Dicas & Novidades</p>
                                        <p className="text-[10px] text-stone-400">Receba dicas de culinária semanais.</p>
                                    </div>
                                    <button onClick={() => togglePref('marketing')} className={`transition-colors ${prefs.marketing ? 'text-orange-500' : 'text-stone-300'}`}>{prefs.marketing ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}</button>
                                </div>
                                <div className="flex items-center justify-between opacity-75">
                                    <div>
                                        <p className="text-sm font-bold text-stone-700">{t('notify_dev_updates')}</p>
                                        <p className="text-[10px] text-stone-400 flex items-center gap-1"><Shield size={10} /> {t('notify_cant_disable')}</p>
                                    </div>
                                    <button disabled className="text-stone-400 cursor-not-allowed" title={t('notify_cant_disable')}><ToggleRight size={32} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4"><Shield className="text-orange-500" size={20} /><h3 className="text-lg font-bold text-stone-900">{t('security')}</h3></div>
                    <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                        <p className="text-sm text-stone-500 mb-4">{t('security_desc')}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-2">{t('password')}</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                                        <input type="password" placeholder="••••••••" disabled className="w-full bg-stone-50 border border-stone-100 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-stone-500 cursor-not-allowed" />
                                    </div>
                                    <button disabled className="px-6 rounded-xl bg-stone-100 text-stone-400 font-bold text-xs">{t('save')}</button>
                                </div>
                                <p className="text-[10px] text-stone-300 mt-2">Alteração de senha desabilitada no modo demonstração.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4"><Database className="text-orange-500" size={20} /><h3 className="text-lg font-bold text-stone-900">{t('data')}</h3></div>
                    <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                        <p className="text-sm text-stone-500 mb-4">{t('data_desc')}</p>
                        <button onClick={handleExport} className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-orange-50 rounded-2xl group transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-xl text-stone-400 group-hover:text-orange-500 transition-colors"><Download size={18} /></div>
                                <span className="font-bold text-stone-700 text-sm">{t('export_data')}</span>
                            </div>
                        </button>
                        <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-2xl group transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-xl text-red-400 group-hover:text-red-500 transition-colors"><Trash2 size={18} /></div>
                                <span className="font-bold text-red-700 text-sm">{t('delete_account')}</span>
                            </div>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Download, Trash2, KeyRound, Save, Bell, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState(authService.getUser());
  const [notifications, setNotifications] = useState([]);
  const [prefs, setPrefs] = useState({ recipeUpdates: true, marketing: true });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setNotifications(notificationService.getNotificationsForUser(user.id));
    if (user.preferences) {
        setPrefs(user.preferences);
    }
  }, [user, navigate]);

  const handleExport = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chef_em_casa_data.json';
    a.click();
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure? This will clear all local data.')) {
        authService.logout();
        localStorage.clear();
        navigate('/');
    }
  };

  const togglePref = (key) => {
      const newPrefs = { ...prefs, [key]: !prefs[key] };
      setPrefs(newPrefs);
      if (user) {
          const updatedUser = { ...user, preferences: newPrefs };
          authService.updateUser(updatedUser);
          setUser(updatedUser);
      }
  };

  if (!user) return null;

  return (
    <div className="px-4 py-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-8">
        <Link to="/" className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900">
           <ArrowLeft size={16} />
        </Link>
        <h1 className="text-2xl font-black text-stone-900">{t('profile_settings')}</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm flex items-center gap-4">
             {user.avatar ? (
                <img src={user.avatar} className="w-16 h-16 rounded-full border border-stone-200" alt={user.name} />
             ) : (
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-2xl">
                   {user.name.charAt(0)}
                </div>
             )}
             <div>
                 <h2 className="text-xl font-bold text-stone-900">{user.name}</h2>
                 <p className="text-stone-400 text-sm">{user.email}</p>
                 <span className="inline-block mt-2 bg-stone-100 text-stone-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                    {user.role}
                 </span>
             </div>
        </div>

        <section>
            <div className="flex items-center gap-2 mb-4">
                <Bell className="text-orange-500" size={20} />
                <h3 className="text-lg font-bold text-stone-900">{t('notifications')}</h3>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-stone-400 mb-3 uppercase tracking-wider">Histórico</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <p className="text-sm text-stone-400 italic">{t('no_notifications')}</p>
                        ) : (
                            notifications.map(note => (
                                <div key={note.id} className={`p-3 rounded-2xl border ${note.read ? 'bg-stone-50 border-stone-100' : 'bg-orange-50 border-orange-100'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold ${note.read ? 'text-stone-600' : 'text-orange-800'}`}>
                                            {note.title}
                                        </span>
                                        <span className="text-[10px] text-stone-400">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-500">{note.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="h-px bg-stone-100 w-full" />

                <div>
                    <h4 className="text-xs font-bold text-stone-400 mb-4 uppercase tracking-wider">{t('notification_pref')}</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-stone-700">{t('notify_recipe_updates')}</p>
                                <p className="text-[10px] text-stone-400">Quando suas receitas forem aprovadas.</p>
                            </div>
                            <button onClick={() => togglePref('recipeUpdates')} className={`transition-colors ${prefs.recipeUpdates ? 'text-orange-500' : 'text-stone-300'}`}>
                                {prefs.recipeUpdates ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-stone-700">Dicas & Novidades</p>
                                <p className="text-[10px] text-stone-400">Receba dicas de culinária semanais.</p>
                            </div>
                            <button onClick={() => togglePref('marketing')} className={`transition-colors ${prefs.marketing ? 'text-orange-500' : 'text-stone-300'}`}>
                                {prefs.marketing ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between opacity-75">
                            <div>
                                <p className="text-sm font-bold text-stone-700">{t('notify_dev_updates')}</p>
                                <p className="text-[10px] text-stone-400 flex items-center gap-1">
                                    <Shield size={10} /> {t('notify_cant_disable')}
                                </p>
                            </div>
                            <button disabled className="text-stone-400 cursor-not-allowed" title={t('notify_cant_disable')}>
                                <ToggleRight size={32} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <div className="flex items-center gap-2 mb-4">
                <Shield className="text-orange-500" size={20} />
                <h3 className="text-lg font-bold text-stone-900">{t('security')}</h3>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                <p className="text-sm text-stone-500 mb-4">{t('security_desc')}</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2">{t('password')}</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                                <input type="password" placeholder="••••••••" disabled className="w-full bg-stone-50 border border-stone-100 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-stone-500 cursor-not-allowed" />
                            </div>
                            <button disabled className="px-6 rounded-xl bg-stone-100 text-stone-400 font-bold text-xs">{t('save')}</button>
                        </div>
                        <p className="text-[10px] text-stone-300 mt-2">Alteração de senha desabilitada no modo demonstração.</p>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <div className="flex items-center gap-2 mb-4">
                <Database className="text-orange-500" size={20} />
                <h3 className="text-lg font-bold text-stone-900">{t('data')}</h3>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-sm space-y-4">
                 <p className="text-sm text-stone-500 mb-4">{t('data_desc')}</p>
                 <button onClick={handleExport} className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-orange-50 rounded-2xl group transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl text-stone-400 group-hover:text-orange-500 transition-colors">
                            <Download size={18} />
                        </div>
                        <span className="font-bold text-stone-700 text-sm">{t('export_data')}</span>
                    </div>
                 </button>

                 <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-2xl group transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl text-red-400 group-hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                        </div>
                        <span className="font-bold text-red-700 text-sm">{t('delete_account')}</span>
                    </div>
                 </button>
            </div>
        </section>

      </div>
    </div>
  );
}
