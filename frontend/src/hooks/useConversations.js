import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, getAuth } from "../api";

export default function useConversations() {
  const accountId = getAuth()?.id;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const revision = useRef(0);
  const busy = useRef(0);
  const mounted = useRef(false);
  const controller = useRef(null);

  const refresh = useCallback(async () => {
    if (!accountId || busy.current || controller.current) return;
    const version = revision.current;
    const abort = new AbortController();
    controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 15000);
    try {
      const chats = await apiRequest("/chats", { signal: abort.signal });
      if (mounted.current && version === revision.current) {
        setConversations(chats);
        setConnected(true);
        setError("");
      }
    } catch (err) {
      if (mounted.current && version === revision.current) {
        setConnected(false);
        setError(err.name === "AbortError" ? "Connection timed out. Retrying automatically." : err.message);
      }
    } finally {
      clearTimeout(timeout);
      if (controller.current === abort) controller.current = null;
      if (mounted.current) setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 2500);
    const resume = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      mounted.current = false;
      revision.current += 1;
      controller.current?.abort();
      controller.current = null;
      clearInterval(interval);
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [refresh]);

  const mutate = useCallback(async (path, options, isRead = false) => {
    revision.current += 1;
    busy.current += 1;
    try {
      const result = await apiRequest(path, options);
      if (mounted.current) {
        if (!isRead) setConversations((current) => [result, ...current.filter((chat) => chat.id !== result.id)]);
        else setConversations((current) => current.map((chat) => {
          if (chat.id !== path.split("/")[2]) return chat;
          const readIds = new Set(result.readMessageIds);
          return { ...chat, unread: Math.max(0, chat.unread - readIds.size), messages: chat.messages.map((message) =>
            readIds.has(message.id) ? { ...message, readAt: new Date().toISOString() } : message
          ) };
        }));
      }
      return result;
    } finally {
      revision.current += 1;
      busy.current -= 1;
    }
  }, []);
  return { conversations, loading, error, connected, refresh, mutate };
}
