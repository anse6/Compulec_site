/**
 * Alertes du chat : son (Web Audio, aucun fichier à charger) et notifications du bureau.
 */

const SOUND_KEY = "compulec_chat_sound";
let audioContext = null;

// Les navigateurs n'autorisent le son qu'après une action de l'utilisateur :
// on prépare le contexte audio au premier clic ou à la première touche.
function unlockOnFirstGesture() {
  const unlock = () => {
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume?.();
    } catch {
      /* son indisponible : on continue sans */
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}
if (typeof window !== "undefined") unlockOnFirstGesture();

export function isSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
  } catch {
    /* préférence non mémorisée */
  }
}

/**
 * Petit carillon. "request" (nouvelle demande de conseiller) est plus marqué que "message".
 */
export function playChime(kind = "message", { force = false } = {}) {
  if ((!force && !isSoundEnabled()) || !audioContext || audioContext.state !== "running") return;
  const notes = kind === "request" ? [660, 880, 1100] : [880, 1175];
  const start = audioContext.currentTime;
  notes.forEach((frequency, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    const t = start + i * 0.14;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

export function desktopNotificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function desktopPermission() {
  return desktopNotificationsSupported() ? Notification.permission : "denied";
}

export async function requestDesktopPermission() {
  if (!desktopNotificationsSupported()) return "denied";
  return Notification.requestPermission();
}

/**
 * Notification du système, seulement quand l'onglet n'est pas au premier plan
 * (sinon la notification dans la page suffit).
 */
export function notifyDesktop(title, body, onClick) {
  if (desktopPermission() !== "granted" || !document.hidden) return;
  try {
    const n = new Notification(title, { body, tag: "compulec-chat", renotify: true });
    n.onclick = () => {
      window.focus();
      onClick?.();
      n.close();
    };
  } catch {
    /* notifications indisponibles */
  }
}
