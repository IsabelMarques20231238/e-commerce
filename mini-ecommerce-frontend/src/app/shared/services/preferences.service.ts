import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

export type AppLanguage = 'pt' | 'en' | 'fr';

const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  pt: 'Portugues',
  en: 'English',
  fr: 'Francais'
};

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  pt: {
    home: 'Inicio',
    categories: 'Categorias',
    myAccount: 'Minha Conta',
    cart: 'Meu Carrinho',
    searchPlaceholder: 'Pesquisar na Shopee...',
    helloUser: 'Ola, Joao de Oliveira Silva',
    language: 'Idioma',
    darkMode: 'Modo escuro',
    logout: 'Sair',
    memberGold: 'Membro Gold',
    personalData: 'Dados Pessoais',
    myOrders: 'Meus Pedidos',
    favorites: 'Favoritos',
    security: 'Seguranca',
    applyWholeSite: 'Aplicar em todo o site',
    logoutAccount: 'Sair da Conta',
    totalOrders: 'Total de pedidos',
    inCart: 'No carrinho',
    accountData: 'Dados da Conta',
    edit: 'Editar',
    phone: 'Telefone',
    memberSince: 'Membro desde',
    mainAddress: 'Endereco de Entrega Principal'
  },
  en: {
    home: 'Home',
    categories: 'Categories',
    myAccount: 'My Account',
    cart: 'My Cart',
    searchPlaceholder: 'Search on Shopee...',
    helloUser: 'Hello, Joao de Oliveira Silva',
    language: 'Language',
    darkMode: 'Dark mode',
    logout: 'Logout',
    memberGold: 'Gold member',
    personalData: 'Personal Data',
    myOrders: 'My Orders',
    favorites: 'Favorites',
    security: 'Security',
    applyWholeSite: 'Apply to the whole site',
    logoutAccount: 'Logout',
    totalOrders: 'Total orders',
    inCart: 'In cart',
    accountData: 'Account Data',
    edit: 'Edit',
    phone: 'Phone',
    memberSince: 'Member since',
    mainAddress: 'Main Delivery Address'
  },
  fr: {
    home: 'Accueil',
    categories: 'Categories',
    myAccount: 'Mon Compte',
    cart: 'Mon Panier',
    searchPlaceholder: 'Rechercher sur Shopee...',
    helloUser: 'Bonjour, Joao de Oliveira Silva',
    language: 'Langue',
    darkMode: 'Mode sombre',
    logout: 'Deconnexion',
    memberGold: 'Membre Gold',
    personalData: 'Donnees personnelles',
    myOrders: 'Mes commandes',
    favorites: 'Favoris',
    security: 'Securite',
    applyWholeSite: 'Appliquer a tout le site',
    logoutAccount: 'Se deconnecter',
    totalOrders: 'Total des commandes',
    inCart: 'Dans le panier',
    accountData: 'Donnees du compte',
    edit: 'Modifier',
    phone: 'Telephone',
    memberSince: 'Membre depuis',
    mainAddress: 'Adresse de livraison principale'
  }
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly languageOptions: AppLanguage[] = ['pt', 'en', 'fr'];
  readonly darkMode = signal(this.readBooleanPreference('darkMode'));
  readonly language = signal<AppLanguage>(this.readLanguagePreference());
  readonly languageLabel = computed(() => LANGUAGE_LABELS[this.language()]);

  constructor() {
    this.applyPreferences();
  }

  toggleDarkMode() {
    this.darkMode.update(value => !value);
    this.savePreferences();
    this.applyPreferences();
  }

  setLanguage(language: AppLanguage) {
    this.language.set(language);
    this.savePreferences();
    this.applyPreferences();
  }

  getLanguageLabel(language: AppLanguage) {
    return LANGUAGE_LABELS[language];
  }

  t(key: string) {
    return TRANSLATIONS[this.language()][key] ?? TRANSLATIONS.pt[key] ?? key;
  }

  private readBooleanPreference(key: string) {
    if (!this.isBrowser) return false;
    return localStorage.getItem(key) === 'true';
  }

  private readLanguagePreference(): AppLanguage {
    if (!this.isBrowser) return 'pt';

    const savedLanguage = localStorage.getItem('language') as AppLanguage | null;
    return savedLanguage && this.languageOptions.includes(savedLanguage) ? savedLanguage : 'pt';
  }

  private savePreferences() {
    if (!this.isBrowser) return;
    localStorage.setItem('darkMode', String(this.darkMode()));
    localStorage.setItem('language', this.language());
  }

  private applyPreferences() {
    const root = this.document.documentElement;
    root.classList.toggle('dark', this.darkMode());
    root.lang = this.language();
  }
}
