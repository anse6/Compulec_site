import { useEffect, useRef } from "react";
import { useDispatch, useStore } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { notification } from "antd";
import { chatApi } from "../../../services/api/chatApi";
import { API_TAGS } from "../../../services/constants";
import { startStaffChatStream } from "../../../services/chatRealtime";
import { notifyDesktop, playChime } from "../../../services/chatAlerts";

/**
 * Branche le back-office sur le temps réel du chat, sur toutes les pages de l'admin :
 * - chaque événement rafraîchit immédiatement les données du chat (listes, compteurs, conversation) ;
 * - nouvelle demande de conseiller : son + notification dans la page + notification du bureau ;
 * - nouveau message d'un visiteur en attente ou en cours : son discret (+ bureau si l'onglet est caché).
 */
export default function useStaffChatNotifications() {
  const dispatch = useDispatch();
  const store = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const invalidateTimer = useRef(null);
  // Les traductions et la navigation peuvent changer sans relancer la connexion
  const latest = useRef({ t, navigate });
  latest.current = { t, navigate };

  useEffect(() => {
    const refreshToken = async () => {
      // Une requête protégée déclenche le renouvellement automatique du jeton (cookie HttpOnly)
      const result = await dispatch(
        chatApi.endpoints.getChatCounts.initiate(undefined, { forceRefetch: true, subscribe: false }),
      );
      return !result.error && !!store.getState().auth.accessToken;
    };

    const stop = startStaffChatStream({
      getToken: () => store.getState().auth.accessToken,
      refreshToken,
      onEvent: (event) => {
        // Regroupe les rafales d'événements en un seul rafraîchissement
        clearTimeout(invalidateTimer.current);
        invalidateTimer.current = setTimeout(
          () => dispatch(chatApi.util.invalidateTags([API_TAGS.CHAT])),
          150,
        );

        const { t: tr, navigate: go } = latest.current;
        const openChat = () => go("/admin/aichat");
        const name = event.visitorName || tr("admin.aiChat.anonymous");

        if (event.type === "TRANSFER_REQUESTED") {
          playChime("request");
          notification.open({
            key: `chat-${event.sessionToken}`,
            message: tr("admin.aiChat.notifyNewRequest"),
            description: tr("admin.aiChat.notifyNewRequestDesc", { name }),
            onClick: openChat,
            duration: 8,
            style: { cursor: "pointer" },
          });
          notifyDesktop(tr("admin.aiChat.notifyNewRequest"), tr("admin.aiChat.notifyNewRequestDesc", { name }), openChat);
        } else if (
          event.type === "VISITOR_MESSAGE" &&
          (event.status === "WAITING_ADMIN" || event.status === "WITH_ADMIN")
        ) {
          playChime("message");
          notifyDesktop(tr("admin.aiChat.notifyNewMessage", { name }), tr("admin.aiChat.notifyOpen"), openChat);
        }
      },
    });

    return () => {
      stop();
      clearTimeout(invalidateTimer.current);
    };
  }, [dispatch, store]);
}
