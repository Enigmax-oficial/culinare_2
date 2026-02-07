import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    app_name: 'ChefEmCasa',
    recipes: 'Receitas',
    my_recipes: 'Minhas Receitas',
    new_recipe: 'Nova Receita',
    search_placeholder: 'Buscar receitas...',
    no_results: 'Nenhuma receita encontrada',
    ingredients: 'Ingredientes',
    preparation: 'Modo de Preparo',
    comments: 'Comentários',
    leave_comment: 'Deixe seu comentário...',
    send: 'Enviar',
    login: 'Entrar',
    logout: 'Sair',
    difficulty: 'Dificuldade',
    time: 'Tempo',
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    pending: 'Pendente',
    approve: 'Aprovar',
    reject: 'Rejeitar',
    back: 'Voltar',
    admin_panel: 'Painel Admin',
    hero_title: 'Descubra e compartilhe receitas incríveis',
    hero_subtitle: 'Uma comunidade de amantes da culinária. Publique suas receitas, descubra novos pratos e inspire-se.',
    admin_area: 'Área Restrita',
    admin_desc: 'Você está logado como Desenvolvedor. Aprove receitas da comunidade.',
    basic_info: 'Informações Básicas',
    recipe_title: 'Título da Receita',
    description: 'Descrição',
    prep_time: 'Preparo (min)',
    cook_time: 'Cozimento (min)',
    category: 'Categoria',
    add_ingredient: 'Adicionar Ingrediente',
    add_step: 'Adicionar Passo',
    publish: 'Publicar Receita',
    cancel: 'Cancelar',
    magic: 'Mágica',
    image_upload_text: 'Clique para enviar uma foto',
    checklist_hint: 'Toque nos itens para marcar como concluído',
    password: 'Senha',
    settings: 'Configurações',
    security: 'Segurança',
    data: 'Dados',
    profile_settings: 'Configurações do Perfil',
    export_data: 'Exportar Meus Dados',
    delete_account: 'Excluir Conta',
    security_desc: 'Gerencie suas senhas e acesso.',
    data_desc: 'Gerencie seus dados pessoais e preferências.',
    save: 'Salvar'
  },
  en: {
    app_name: 'ChefAtHome',
    recipes: 'Recipes',
    my_recipes: 'My Recipes',
    new_recipe: 'New Recipe',
    search_placeholder: 'Search recipes...',
    no_results: 'No recipes found',
    ingredients: 'Ingredients',
    preparation: 'Preparation',
    comments: 'Comments',
    leave_comment: 'Leave a comment...',
    send: 'Send',
    login: 'Login',
    logout: 'Logout',
    difficulty: 'Difficulty',
    time: 'Time',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    pending: 'Pending',
    approve: 'Approve',
    reject: 'Reject',
    back: 'Back',
    admin_panel: 'Admin Panel',
    hero_title: 'Discover and share amazing recipes',
    hero_subtitle: 'A community of food lovers. Post your recipes, discover new dishes and get inspired.',
    admin_area: 'Restricted Area',
    admin_desc: 'You are logged in as Developer. Approve community recipes.',
    basic_info: 'Basic Information',
    recipe_title: 'Recipe Title',
    description: 'Description',
    prep_time: 'Prep (min)',
    cook_time: 'Cook (min)',
    category: 'Category',
    add_ingredient: 'Add Ingredient',
    add_step: 'Add Step',
    publish: 'Publish Recipe',
    cancel: 'Cancel',
    magic: 'Magic',
    image_upload_text: 'Click to upload photo',
    checklist_hint: 'Tap items to mark as done',
    password: 'Password',
    settings: 'Settings',
    security: 'Security',
    data: 'Data',
    profile_settings: 'Profile Settings',
    export_data: 'Export My Data',
    delete_account: 'Delete Account',
    security_desc: 'Manage your passwords and access.',
    data_desc: 'Manage your personal data and preferences.',
    save: 'Save'
  },
  es: {
    app_name: 'ChefEnCasa',
    recipes: 'Recetas',
    my_recipes: 'Mis Recetas',
    new_recipe: 'Nueva Receta',
    search_placeholder: 'Buscar recetas...',
    no_results: 'No se encontraron recetas',
    ingredients: 'Ingredientes',
    preparation: 'Preparación',
    comments: 'Comentarios',
    leave_comment: 'Deja un comentario...',
    send: 'Enviar',
    login: 'Entrar',
    logout: 'Salir',
    difficulty: 'Dificultad',
    time: 'Tiempo',
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
    pending: 'Pendiente',
    approve: 'Aprobar',
    reject: 'Rechazar',
    back: 'Volver',
    admin_panel: 'Panel de Admin',
    hero_title: 'Descubre y comparte recetas increíbles',
    hero_subtitle: 'Una comunidad de amantes de la comida. Publica tus recetas, descubre nuevos platos e inspírate.',
    admin_area: 'Área Restringida',
    admin_desc: 'Has iniciado sesión como Desarrollador. Aprueba recetas de la comunidad.',
    basic_info: 'Información Básica',
    recipe_title: 'Título de la Receta',
    description: 'Descripción',
    prep_time: 'Preporación (min)',
    cook_time: 'Cocción (min)',
    category: 'Categoría',
    add_ingredient: 'Añadir Ingrediente',
    add_step: 'Añadir Paso',
    publish: 'Publicar Receta',
    cancel: 'Cancelar',
    magic: 'Magia',
    image_upload_text: 'Clic para subir foto',
    checklist_hint: 'Toca los elementos para marcar como hecho',
    password: 'Contraseña',
    settings: 'Configuración',
    security: 'Seguridad',
    data: 'Datos',
    profile_settings: 'Configuración de Perfil',
    export_data: 'Exportar Mis Datos',
    delete_account: 'Eliminar Cuenta',
    security_desc: 'Administra tus contraseñas y acceso.',
    data_desc: 'Administra tus datos personales y preferencias.',
    save: 'Guardar'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children?: ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}