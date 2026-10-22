// ============================================================
// i18n — Translations for language switching
// ============================================================

import type { AppLanguage } from '../types';

type TranslationKey =
  | 'chats' | 'settings' | 'admin' | 'search' | 'searchPlaceholder'
  | 'newGroup' | 'newChannel' | 'typeMessage' | 'send' | 'premium'
  | 'editProfile' | 'chatSettings' | 'privacySettings' | 'devices'
  | 'language' | 'logout' | 'profile' | 'stickers' | 'createMeme'
  | 'muted' | 'broadcastOnly' | 'online' | 'lastSeen' | 'members'
  | 'subscribe' | 'premiumFeatures' | 'users' | 'logs' | 'analytics'
  | 'ban' | 'unban' | 'togglePremium' | 'terminateSessions' | 'save'
  | 'cancel' | 'create' | 'join' | 'globalSearch' | 'noResults'
  | 'signInGoogle' | 'signInPhone' | 'verifyOtp' | 'createProfile'
  | 'displayName' | 'username' | 'bio' | 'phoneNumber' | 'countryCode'
  | 'enterOtp' | 'resendCode' | 'next' | 'back' | 'welcome';

type Translations = Record<TranslationKey, string>;

const translations: Record<AppLanguage, Translations> = {
  en: {
    chats: 'Chats', settings: 'Settings', admin: 'Admin', search: 'Search',
    searchPlaceholder: 'Search or start new chat', newGroup: 'New Group',
    newChannel: 'New Channel', typeMessage: 'Write a message...', send: 'Send',
    premium: 'Telegram Premium', editProfile: 'Edit Profile',
    chatSettings: 'Chat Settings', privacySettings: 'Privacy & Security',
    devices: 'Devices', language: 'Language', logout: 'Log Out',
    profile: 'Profile', stickers: 'Stickers & Memes', createMeme: 'Create Meme',
    muted: 'Muted', broadcastOnly: 'Broadcast Only', online: 'online',
    lastSeen: 'last seen', members: 'members', subscribe: 'Subscribe',
    premiumFeatures: 'Premium Features', users: 'Users', logs: 'System Logs',
    analytics: 'Analytics', ban: 'Ban', unban: 'Unban', togglePremium: 'Toggle Premium',
    terminateSessions: 'Terminate Other Sessions', save: 'Save', cancel: 'Cancel',
    create: 'Create', join: 'Join', globalSearch: 'Global Search Results',
    noResults: 'No results found', signInGoogle: 'Sign in with Google',
    signInPhone: 'Sign in with Phone', verifyOtp: 'Verify Code',
    createProfile: 'Create Profile', displayName: 'Display Name',
    username: 'Username', bio: 'Bio', phoneNumber: 'Phone Number',
    countryCode: 'Country Code', enterOtp: 'Enter verification code',
    resendCode: 'Resend code', next: 'Next', back: 'Back', welcome: 'Welcome to Telegram',
  },
  ru: {
    chats: 'Чаты', settings: 'Настройки', admin: 'Админ', search: 'Поиск',
    searchPlaceholder: 'Поиск или новый чат', newGroup: 'Новая группа',
    newChannel: 'Новый канал', typeMessage: 'Написать сообщение...', send: 'Отправить',
    premium: 'Telegram Premium', editProfile: 'Редактировать профиль',
    chatSettings: 'Настройки чата', privacySettings: 'Конфиденциальность',
    devices: 'Устройства', language: 'Язык', logout: 'Выйти',
    profile: 'Профиль', stickers: 'Стикеры и мемы', createMeme: 'Создать мем',
    muted: 'Отключён', broadcastOnly: 'Только трансляция', online: 'в сети',
    lastSeen: 'был(а)', members: 'участников', subscribe: 'Подписаться',
    premiumFeatures: 'Функции Premium', users: 'Пользователи', logs: 'Системные логи',
    analytics: 'Аналитика', ban: 'Заблокировать', unban: 'Разблокировать',
    togglePremium: 'Переключить Premium', terminateSessions: 'Завершить другие сессии',
    save: 'Сохранить', cancel: 'Отмена', create: 'Создать', join: 'Вступить',
    globalSearch: 'Глобальный поиск', noResults: 'Ничего не найдено',
    signInGoogle: 'Войти через Google', signInPhone: 'Войти по телефону',
    verifyOtp: 'Подтвердить код', createProfile: 'Создать профиль',
    displayName: 'Имя', username: 'Имя пользователя', bio: 'О себе',
    phoneNumber: 'Номер телефона', countryCode: 'Код страны',
    enterOtp: 'Введите код подтверждения', resendCode: 'Отправить снова',
    next: 'Далее', back: 'Назад', welcome: 'Добро пожаловать в Telegram',
  },
  ar: {
    chats: 'المحادثات', settings: 'الإعدادات', admin: 'الإدارة', search: 'بحث',
    searchPlaceholder: 'ابحث أو ابدأ محادثة', newGroup: 'مجموعة جديدة',
    newChannel: 'قناة جديدة', typeMessage: 'اكتب رسالة...', send: 'إرسال',
    premium: 'تيليغرام بريميوم', editProfile: 'تعديل الملف الشخصي',
    chatSettings: 'إعدادات المحادثة', privacySettings: 'الخصوصية والأمان',
    devices: 'الأجهزة', language: 'اللغة', logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي', stickers: 'الملصقات والميمز', createMeme: 'إنشاء ميم',
    muted: 'مكتوم', broadcastOnly: 'بث فقط', online: 'متصل',
    lastSeen: 'آخر ظهور', members: 'أعضاء', subscribe: 'اشتراك',
    premiumFeatures: 'ميزات بريميوم', users: 'المستخدمون', logs: 'سجلات النظام',
    analytics: 'التحليلات', ban: 'حظر', unban: 'إلغاء الحظر',
    togglePremium: 'تبديل بريميوم', terminateSessions: 'إنهاء الجلسات الأخرى',
    save: 'حفظ', cancel: 'إلغاء', create: 'إنشاء', join: 'انضمام',
    globalSearch: 'نتائج البحث العالمي', noResults: 'لا توجد نتائج',
    signInGoogle: 'تسجيل الدخول بجوجل', signInPhone: 'تسجيل الدخول بالهاتف',
    verifyOtp: 'تحقق من الرمز', createProfile: 'إنشاء ملف شخصي',
    displayName: 'الاسم المعروض', username: 'اسم المستخدم', bio: 'نبذة',
    phoneNumber: 'رقم الهاتف', countryCode: 'رمز الدولة',
    enterOtp: 'أدخل رمز التحقق', resendCode: 'إعادة الإرسال',
    next: 'التالي', back: 'رجوع', welcome: 'مرحباً بك في تيليغرام',
  },
  de: {
    chats: 'Chats', settings: 'Einstellungen', admin: 'Admin', search: 'Suche',
    searchPlaceholder: 'Suchen oder neuen Chat starten', newGroup: 'Neue Gruppe',
    newChannel: 'Neuer Kanal', typeMessage: 'Nachricht schreiben...', send: 'Senden',
    premium: 'Telegram Premium', editProfile: 'Profil bearbeiten',
    chatSettings: 'Chat-Einstellungen', privacySettings: 'Datenschutz & Sicherheit',
    devices: 'Geräte', language: 'Sprache', logout: 'Abmelden',
    profile: 'Profil', stickers: 'Sticker & Memes', createMeme: 'Meme erstellen',
    muted: 'Stumm', broadcastOnly: 'Nur Broadcast', online: 'online',
    lastSeen: 'zuletzt gesehen', members: 'Mitglieder', subscribe: 'Abonnieren',
    premiumFeatures: 'Premium-Funktionen', users: 'Benutzer', logs: 'Systemprotokolle',
    analytics: 'Analytik', ban: 'Sperren', unban: 'Entsperren',
    togglePremium: 'Premium umschalten', terminateSessions: 'Andere Sitzungen beenden',
    save: 'Speichern', cancel: 'Abbrechen', create: 'Erstellen', join: 'Beitreten',
    globalSearch: 'Globale Suchergebnisse', noResults: 'Keine Ergebnisse',
    signInGoogle: 'Mit Google anmelden', signInPhone: 'Mit Telefon anmelden',
    verifyOtp: 'Code verifizieren', createProfile: 'Profil erstellen',
    displayName: 'Anzeigename', username: 'Benutzername', bio: 'Bio',
    phoneNumber: 'Telefonnummer', countryCode: 'Ländervorwahl',
    enterOtp: 'Bestätigungscode eingeben', resendCode: 'Code erneut senden',
    next: 'Weiter', back: 'Zurück', welcome: 'Willkommen bei Telegram',
  },
  fr: {
    chats: 'Discussions', settings: 'Paramètres', admin: 'Admin', search: 'Recherche',
    searchPlaceholder: 'Rechercher ou nouvelle discussion', newGroup: 'Nouveau groupe',
    newChannel: 'Nouveau canal', typeMessage: 'Écrire un message...', send: 'Envoyer',
    premium: 'Telegram Premium', editProfile: 'Modifier le profil',
    chatSettings: 'Paramètres de discussion', privacySettings: 'Confidentialité',
    devices: 'Appareils', language: 'Langue', logout: 'Déconnexion',
    profile: 'Profil', stickers: 'Autocollants & Mèmes', createMeme: 'Créer un mème',
    muted: 'Silencieux', broadcastOnly: 'Diffusion uniquement', online: 'en ligne',
    lastSeen: 'vu(e)', members: 'membres', subscribe: "S'abonner",
    premiumFeatures: 'Fonctionnalités Premium', users: 'Utilisateurs', logs: 'Journaux système',
    analytics: 'Analyses', ban: 'Bannir', unban: 'Débannir',
    togglePremium: 'Basculer Premium', terminateSessions: 'Terminer les autres sessions',
    save: 'Enregistrer', cancel: 'Annuler', create: 'Créer', join: 'Rejoindre',
    globalSearch: 'Résultats de recherche globale', noResults: 'Aucun résultat',
    signInGoogle: 'Se connecter avec Google', signInPhone: 'Se connecter par téléphone',
    verifyOtp: 'Vérifier le code', createProfile: 'Créer un profil',
    displayName: "Nom d'affichage", username: "Nom d'utilisateur", bio: 'Bio',
    phoneNumber: 'Numéro de téléphone', countryCode: 'Indicatif pays',
    enterOtp: 'Entrez le code de vérification', resendCode: 'Renvoyer le code',
    next: 'Suivant', back: 'Retour', welcome: 'Bienvenue sur Telegram',
  },
  es: {
    chats: 'Chats', settings: 'Ajustes', admin: 'Admin', search: 'Buscar',
    searchPlaceholder: 'Buscar o nuevo chat', newGroup: 'Nuevo grupo',
    newChannel: 'Nuevo canal', typeMessage: 'Escribe un mensaje...', send: 'Enviar',
    premium: 'Telegram Premium', editProfile: 'Editar perfil',
    chatSettings: 'Ajustes de chat', privacySettings: 'Privacidad y seguridad',
    devices: 'Dispositivos', language: 'Idioma', logout: 'Cerrar sesión',
    profile: 'Perfil', stickers: 'Pegatinas y memes', createMeme: 'Crear meme',
    muted: 'Silenciado', broadcastOnly: 'Solo difusión', online: 'en línea',
    lastSeen: 'visto(a)', members: 'miembros', subscribe: 'Suscribirse',
    premiumFeatures: 'Funciones Premium', users: 'Usuarios', logs: 'Registros del sistema',
    analytics: 'Análisis', ban: 'Banear', unban: 'Desbanear',
    togglePremium: 'Activar Premium', terminateSessions: 'Terminar otras sesiones',
    save: 'Guardar', cancel: 'Cancelar', create: 'Crear', join: 'Unirse',
    globalSearch: 'Resultados de búsqueda global', noResults: 'Sin resultados',
    signInGoogle: 'Iniciar sesión con Google', signInPhone: 'Iniciar sesión con teléfono',
    verifyOtp: 'Verificar código', createProfile: 'Crear perfil',
    displayName: 'Nombre visible', username: 'Nombre de usuario', bio: 'Bio',
    phoneNumber: 'Número de teléfono', countryCode: 'Código de país',
    enterOtp: 'Ingresa el código de verificación', resendCode: 'Reenviar código',
    next: 'Siguiente', back: 'Atrás', welcome: 'Bienvenido a Telegram',
  },
};

export function useTranslation(lang: AppLanguage) {
  return (key: TranslationKey): string => {
    return translations[lang]?.[key] ?? translations.en[key] ?? key;
  };
}

export { translations };
export type { TranslationKey };
