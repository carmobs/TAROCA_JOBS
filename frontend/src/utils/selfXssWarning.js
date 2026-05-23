const SELF_XSS_WARNING_KEY = '__taroca_jobs_self_xss_warning_shown__';

const BANNER_STYLE = [
  'background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 48%, #f59e0b 100%)',
  'color: #f8fafc',
  'font-size: 15px',
  'font-weight: 800',
  'padding: 14px 18px',
  'border-radius: 14px',
  'box-shadow: 0 12px 34px rgba(15, 23, 42, 0.35)',
].join('; ');

const TITLE_STYLE = [
  'color: #f59e0b',
  'font-size: 14px',
  'font-weight: 800',
].join('; ');

const BODY_STYLE = [
  'color: #dbeafe',
  'font-size: 13px',
  'line-height: 1.7',
].join('; ');

const BADGE_STYLE = [
  'background: rgba(248, 250, 252, 0.12)',
  'color: #f8fafc',
  'padding: 2px 10px',
  'border-radius: 999px',
  'font-size: 11px',
  'font-weight: 800',
  'letter-spacing: 0.08em',
  'text-transform: uppercase',
].join('; ');

function hasAlreadyShownWarning() {
  if (typeof window === 'undefined') return true;

  try {
    if (window.sessionStorage.getItem(SELF_XSS_WARNING_KEY) === '1') {
      return true;
    }

    window.sessionStorage.setItem(SELF_XSS_WARNING_KEY, '1');
    return false;
  } catch {
    if (window.__tarocaJobsSelfXssWarningShown) {
      return true;
    }

    window.__tarocaJobsSelfXssWarningShown = true;
    return false;
  }
}

export function showSelfXssWarning() {
  if (hasAlreadyShownWarning()) return;

  const banner = [
    '╔══════════════════════════════════════════════════════════════╗',
    '║   TAROCA JOBS  •  SELF-XSS PROTECTION                        ║',
    '╚══════════════════════════════════════════════════════════════╝',
  ].join('\n');

  const rules = [
    {
      paso: '1',
      regla: 'No pegues código que no escribiste',
      motivo: 'Puede ejecutar acciones ocultas sobre tu cuenta o tus datos.',
    },
    {
      paso: '2',
      regla: 'Revisa cada línea antes de ejecutar',
      motivo: 'Los atacantes suelen disfrazar comandos como "ayuda" o "soporte".',
    },
    {
      paso: '3',
      regla: 'Confirma el origen del código',
      motivo: 'Solo usa snippets de fuentes confiables y verificadas.',
    },
  ];

  console.groupCollapsed(`%c${banner}`, BANNER_STYLE);
  console.log('%cAdvertencia de seguridad del navegador', TITLE_STYLE);
  console.log(
    '%cEsta consola está pensada para desarrollo. Si alguien te pidió pegar aquí un texto, comando o script, podría tratarse de un ataque Self-XSS.',
    BODY_STYLE
  );
  console.log(
    '%cSolo continúa si entiendes exactamente qué hace cada instrucción y puedes verificar su procedencia.',
    BODY_STYLE
  );
  console.table(rules);
  console.log('%cTAROCA JOBS protege tu sesión, tus solicitudes y tu información de contacto.', BADGE_STYLE);
  console.groupEnd();
}
