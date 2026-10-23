import { useSyncExternalStore } from "react";
import { BASE_URL } from "./constants";

/**
 * Flux temps réel de l'équipe (Server-Sent Events sur GET /chat/admin/stream).
 *
 * EventSource ne permet pas d'envoyer l'en-tête Authorization : on lit donc le flux avec fetch,
 * ce qui garde le jeton hors de l'URL (et des journaux du serveur). Reconnexion automatique
 * avec délai croissant ; sur 401, le jeton est renouvelé puis la connexion reprend.
 */

let connected = false;
const listeners = new Set();

function setConnected(value) {
  if (connected !== value) {
    connected = value;
    listeners.forEach((l) => l());
  }
}

/** État de la connexion temps réel, pour l'afficher dans l'interface. */
export function useChatRealtimeStatus() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => connected,
  );
}

const sleep = (ms, signal) =>
  new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(id);
      resolve();
    });
  });

/** Découpe le texte SSE en événements { event, data }. */
function parseEvents(buffer, onEvent) {
  const blocks = buffer.split(/\r?\n\r?\n/);
  const rest = blocks.pop();
  for (const block of blocks) {
    let event = "message";
    const data = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith(":")) continue; // commentaire (signal de vie)
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
    }
    if (data.length) onEvent(event, data.join("\n"));
  }
  return rest;
}

/**
 * Démarre le flux. Renvoie une fonction d'arrêt.
 *
 * @param getToken      () => access token courant (ou null)
 * @param refreshToken  async () => boolean : renouvelle le jeton (true si réussi)
 * @param onEvent       (payload) => void pour chaque événement « chat »
 */
export function startStaffChatStream({ getToken, refreshToken, onEvent }) {
  const controller = new AbortController();
  const { signal } = controller;

  (async () => {
    let delay = 1000;
    while (!signal.aborted) {
      try {
        let token = getToken();
        if (!token) {
          if (!(await refreshToken())) {
            await sleep(delay, signal);
            delay = Math.min(delay * 2, 30000);
            continue;
          }
          token = getToken();
        }

        const response = await fetch(`${BASE_URL}/chat/admin/stream`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          credentials: "include",
          cache: "no-store",
          signal,
        });

        if (response.status === 401) {
          await refreshToken();
          continue;
        }
        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        setConnected(true);
        delay = 1000;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer = parseEvents(buffer + decoder.decode(value, { stream: true }), (event, data) => {
            if (event !== "chat") return;
            try {
              onEvent(JSON.parse(data));
            } catch {
              /* événement illisible : ignoré */
            }
          });
        }
        // Fin normale (le serveur ferme le flux toutes les 15 min) : reconnexion rapide
        setConnected(false);
        await sleep(500, signal);
      } catch {
        setConnected(false);
        if (signal.aborted) break;
        await sleep(delay, signal);
        delay = Math.min(delay * 2, 30000);
      }
    }
    setConnected(false);
  })();

  return () => controller.abort();
}
