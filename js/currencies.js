/**
 * Configuration et métadonnées des devises supportées
 * Données enrichies : nom français, symbole monétaire, drapeau emoji, pays et palette de couleur.
 */

const CURRENCIES = {
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', country: 'Zone Euro', decimals: 2, bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', color: '#FBBF24' },
  USD: { code: 'USD', name: 'Dollar américain', symbol: '$', flag: '🇺🇸', country: 'États-Unis', decimals: 2, bg: 'linear-gradient(135deg, #065f46, #10b981)', color: '#FFFFFF' },
  GBP: { code: 'GBP', name: 'Livre sterling', symbol: '£', flag: '🇬🇧', country: 'Royaume-Uni', decimals: 2, bg: 'linear-gradient(135deg, #4c1d95, #8b5cf6)', color: '#FFFFFF' },
  JPY: { code: 'JPY', name: 'Yen japonais', symbol: '¥', flag: '🇯🇵', country: 'Japon', decimals: 0, bg: 'linear-gradient(135deg, #991b1b, #ef4444)', color: '#FFFFFF' },
  CHF: { code: 'CHF', name: 'Franc suisse', symbol: 'CHF', flag: '🇨🇭', country: 'Suisse', decimals: 2, bg: 'linear-gradient(135deg, #b91c1c, #dc2626)', color: '#FFFFFF' },
  CAD: { code: 'CAD', name: 'Dollar canadien', symbol: 'CA$', flag: '🇨🇦', country: 'Canada', decimals: 2, bg: 'linear-gradient(135deg, #c2410c, #ea580c)', color: '#FFFFFF' },
  AUD: { code: 'AUD', name: 'Dollar australien', symbol: 'A$', flag: '🇦🇺', country: 'Australie', decimals: 2, bg: 'linear-gradient(135deg, #0f766e, #0d9488)', color: '#FFFFFF' },
  CNY: { code: 'CNY', name: 'Yuan renminbi chinois', symbol: '¥', flag: '🇨🇳', country: 'Chine', decimals: 2, bg: 'linear-gradient(135deg, #b45309, #d97706)', color: '#FFFFFF' },
  SEK: { code: 'SEK', name: 'Couronne suédoise', symbol: 'kr', flag: '🇸🇪', country: 'Suède', decimals: 2, bg: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#FDE047' },
  NOK: { code: 'NOK', name: 'Couronne norvégienne', symbol: 'kr', flag: '🇳🇴', country: 'Norvège', decimals: 2, bg: 'linear-gradient(135deg, #0369a1, #0284c7)', color: '#FFFFFF' },
  DKK: { code: 'DKK', name: 'Couronne danoise', symbol: 'kr', flag: '🇩🇰', country: 'Danemark', decimals: 2, bg: 'linear-gradient(135deg, #be123c, #e11d48)', color: '#FFFFFF' },
  PLN: { code: 'PLN', name: 'Złoty polonais', symbol: 'zł', flag: '🇵🇱', country: 'Pologne', decimals: 2, bg: 'linear-gradient(135deg, #e11d48, #f43f5e)', color: '#FFFFFF' },
  CZK: { code: 'CZK', name: 'Couronne tchèque', symbol: 'Kč', flag: '🇨🇿', country: 'République Tchèque', decimals: 2, bg: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#FFFFFF' },
  HUF: { code: 'HUF', name: 'Forint hongrois', symbol: 'Ft', flag: '🇭🇺', country: 'Hongrie', decimals: 0, bg: 'linear-gradient(135deg, #15803d, #22c55e)', color: '#FFFFFF' },
  RON: { code: 'RON', name: 'Leu roumain', symbol: 'lei', flag: '🇷🇴', country: 'Roumanie', decimals: 2, bg: 'linear-gradient(135deg, #1e3a8a, #f59e0b)', color: '#FFFFFF' },
  TRY: { code: 'TRY', name: 'Livre turque', symbol: '₺', flag: '🇹🇷', country: 'Turquie', decimals: 2, bg: 'linear-gradient(135deg, #b91c1c, #dc2626)', color: '#FFFFFF' },
  BRL: { code: 'BRL', name: 'Real brésilien', symbol: 'R$', flag: '🇧🇷', country: 'Brésil', decimals: 2, bg: 'linear-gradient(135deg, #15803d, #eab308)', color: '#FFFFFF' },
  MXN: { code: 'MXN', name: 'Peso mexicain', symbol: 'Mex$', flag: '🇲🇽', country: 'Mexique', decimals: 2, bg: 'linear-gradient(135deg, #047857, #10b981)', color: '#FFFFFF' },
  INR: { code: 'INR', name: 'Roupie indienne', symbol: '₹', flag: '🇮🇳', country: 'Inde', decimals: 2, bg: 'linear-gradient(135deg, #c2410c, #15803d)', color: '#FFFFFF' },
  IDR: { code: 'IDR', name: 'Roupie indonésienne', symbol: 'Rp', flag: '🇮🇩', country: 'Indonésie', decimals: 0, bg: 'linear-gradient(135deg, #b91c1c, #ef4444)', color: '#FFFFFF' },
  ILS: { code: 'ILS', name: 'Shekel israélien', symbol: '₪', flag: '🇮🇱', country: 'Israël', decimals: 2, bg: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#FFFFFF' },
  KRW: { code: 'KRW', name: 'Won sud-coréen', symbol: '₩', flag: '🇰🇷', country: 'Corée du Sud', decimals: 0, bg: 'linear-gradient(135deg, #1e3a8a, #dc2626)', color: '#FFFFFF' },
  MYR: { code: 'MYR', name: 'Ringgit malaisien', symbol: 'RM', flag: '🇲🇾', country: 'Malaisie', decimals: 2, bg: 'linear-gradient(135deg, #1d4ed8, #fbbf24)', color: '#FFFFFF' },
  NZD: { code: 'NZD', name: 'Dollar néo-zélandais', symbol: 'NZ$', flag: '🇳🇿', country: 'Nouvelle-Zélande', decimals: 2, bg: 'linear-gradient(135deg, #0f172a, #2563eb)', color: '#FFFFFF' },
  PHP: { code: 'PHP', name: 'Peso philippin', symbol: '₱', flag: '🇵🇭', country: 'Philippines', decimals: 2, bg: 'linear-gradient(135deg, #1d4ed8, #dc2626)', color: '#FFFFFF' },
  SGD: { code: 'SGD', name: 'Dollar de Singapour', symbol: 'S$', flag: '🇸🇬', country: 'Singapour', decimals: 2, bg: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#FFFFFF' },
  THB: { code: 'THB', name: 'Baht thaïlandais', symbol: '฿', flag: '🇹🇭', country: 'Thaïlande', decimals: 2, bg: 'linear-gradient(135deg, #1e3a8a, #dc2626)', color: '#FFFFFF' },
  ZAR: { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R', flag: '🇿🇦', country: 'Afrique du Sud', decimals: 2, bg: 'linear-gradient(135deg, #15803d, #eab308)', color: '#FFFFFF' },
  HKD: { code: 'HKD', name: 'Dollar de Hong Kong', symbol: 'HK$', flag: '🇭🇰', country: 'Hong Kong', decimals: 2, bg: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#FFFFFF' },
  ISK: { code: 'ISK', name: 'Couronne islandaise', symbol: 'kr', flag: '🇮🇸', country: 'Islande', decimals: 0, bg: 'linear-gradient(135deg, #1e3a8a, #dc2626)', color: '#FFFFFF' }
};

// Paires phares pour le ruban défilant en temps réel
const POPULAR_PAIRS = [
  { from: 'EUR', to: 'USD' },
  { from: 'GBP', to: 'EUR' },
  { from: 'USD', to: 'JPY' },
  { from: 'EUR', to: 'CHF' },
  { from: 'USD', to: 'CAD' },
  { from: 'AUD', to: 'USD' },
  { from: 'EUR', to: 'GBP' },
  { from: 'USD', to: 'CHF' }
];

// Taux de secours au cas où le client est hors ligne lors du premier chargement (base EUR)
const FALLBACK_EUR_RATES = {
  EUR: 1.0,
  USD: 1.0968,
  GBP: 0.8329,
  JPY: 174.85,
  CHF: 0.9243,
  CAD: 1.5690,
  AUD: 1.6294,
  CNY: 7.3126,
  SEK: 11.143,
  NOK: 10.604,
  DKK: 7.4744,
  PLN: 4.4118,
  CZK: 24.386,
  HUF: 368.40,
  RON: 5.3467,
  TRY: 55.320,
  BRL: 6.3818,
  MXN: 20.374,
  INR: 102.49,
  IDR: 20020,
  ILS: 3.5798,
  KRW: 1461.3,
  MYR: 4.5144,
  NZD: 1.9951,
  PHP: 69.832,
  SGD: 1.4144,
  THB: 37.264,
  ZAR: 18.890,
  HKD: 8.6063,
  ISK: 137.0
};
