"use client";

import { FormEvent, useMemo, useRef, useState, type ComponentType } from "react";
import { Bot, Mic, Square, Languages, Loader2, SendHorizonal, Sparkles } from "lucide-react";
import clsx from "classnames";
import { useDriverStore } from "@/store/driver-store";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Tab = "chat" | "voice" | "translate" | "search";

export default function AssistantPage() {
  const { profile, isReady } = useDriverStore((state) => ({
    profile: state.profile,
    isReady: state.isReady,
  }));
  const [tab, setTab] = useState<Tab>("chat");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi driver! I can help with traffic updates, quick translations, earnings insights and health tips. Ask away in Hindi or English.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [translationInput, setTranslationInput] = useState("");
  const [translationOutput, setTranslationOutput] = useState("");
  const [translationDirection, setTranslationDirection] = useState<"hi-en" | "en-hi">("hi-en");
  const [transcription, setTranscription] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState("");

  const greeting = useMemo(
    () => `Namaste ${profile?.name?.split(" ")[0] ?? "driver"}!`,
    [profile?.name]
  );

  const callGemini = async (payload: Record<string, unknown>) => {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Gemini API call failed");
    }
    const data = await response.json();
    return data as { output?: string };
  };

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatInput.trim()) return;
    const newMessage: ChatMessage = { role: "user", content: chatInput.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    setLoading(true);
    try {
      const response = await callGemini({
        type: "chat",
        text: newMessage.content,
        context: messages,
      });
      if (response.output) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.output! }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to reach Gemini right now. Please try later." },
      ]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!translationInput.trim()) return;
    setLoading(true);
    try {
      const response = await callGemini({
        type: "translate",
        direction: translationDirection,
        text: translationInput,
      });
      setTranslationOutput(response.output ?? "");
    } catch (error) {
      setTranslationOutput("Translation failed. Please retry.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await callGemini({
        type: "search",
        text: searchQuery.trim(),
      });
      setSearchResult(response.output ?? "");
    } catch (error) {
      setSearchResult("Smart search failed. Try again when online.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setTranscription("Microphone not supported in this browser.");
      return;
    }
    audioChunks.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        setLoading(true);
        try {
          const response = await callGemini({
            type: "transcribe",
            audio: base64Data,
          });
          setTranscription(response.output ?? "");
        } catch (error) {
          console.error(error);
          setTranscription("Voice transcription failed. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  const tabs: Array<{ key: Tab; label: string; icon: ComponentType<{ size?: number }> }> = [
    { key: "chat", label: "Chat", icon: Bot },
    { key: "voice", label: "Voice", icon: Mic },
    { key: "translate", label: "Translate", icon: Languages },
    { key: "search", label: "Smart Search", icon: Sparkles },
  ];

  if (!isReady) {
    return <div className="card">Loading AI assistant…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white">
        <div className="flex flex-col gap-2">
          <span className="badge bg-white/15 text-white/80">Gemini AI Assistant</span>
          <h1 className="text-2xl font-semibold">{greeting}</h1>
          <p className="text-sm text-white/80">
            Ask in Hindi or English. I can translate, guide routes, plan expenses, advise health habits and help SOS situations.
          </p>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={clsx(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm transition",
                  tab === item.key
                    ? "border-purple-400 bg-purple-50 text-purple-600"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                )}
                type="button"
                onClick={() => setTab(item.key)}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "chat" && (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-2xl border border-slate-200/70 p-4 max-h-[320px] overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={clsx("rounded-2xl p-3 text-sm", {
                    "bg-purple-50 text-slate-700": message.role === "assistant",
                    "bg-slate-900 text-white ml-auto max-w-[85%]": message.role === "user",
                  })}
                >
                  {message.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                placeholder="Ask for traffic, translations, earnings tips…"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
              />
              <button className="button-primary" type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal size={18} />}
                Send
              </button>
            </form>
          </div>
        )}

        {tab === "translate" && (
          <div className="grid gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTranslationDirection("hi-en")}
                className={clsx(
                  "flex-1 rounded-2xl border px-3 py-2 text-sm",
                  translationDirection === "hi-en"
                    ? "border-purple-400 bg-purple-50 text-purple-600"
                    : "border-slate-200"
                )}
              >
                Hindi → English
              </button>
              <button
                type="button"
                onClick={() => setTranslationDirection("en-hi")}
                className={clsx(
                  "flex-1 rounded-2xl border px-3 py-2 text-sm",
                  translationDirection === "en-hi"
                    ? "border-purple-400 bg-purple-50 text-purple-600"
                    : "border-slate-200"
                )}
              >
                English → Hindi
              </button>
            </div>
            <textarea
              className="min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
              placeholder="Type or paste text"
              value={translationInput}
              onChange={(event) => setTranslationInput(event.target.value)}
            />
            <button className="button-primary justify-center" type="button" onClick={handleTranslate} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Languages size={18} />}
              Translate
            </button>
            {translationOutput && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm text-slate-700">
                {translationOutput}
              </div>
            )}
          </div>
        )}

        {tab === "voice" && (
          <div className="grid gap-3">
            <p className="text-sm text-slate-600">
              Tap the microphone, speak in Hindi or English. Gemini converts it to text and syncs with notes.
            </p>
            <button
              className={clsx("button-primary justify-center", recording ? "bg-rose-500 hover:bg-rose-600" : "")}
              type="button"
              onClick={recording ? stopRecording : startRecording}
            >
              {recording ? <Square size={18} /> : <Mic size={18} />}
              {recording ? "Stop Recording" : "Start Recording"}
            </button>
            {loading && <Loader2 className="mx-auto size-6 animate-spin text-purple-600" />}
            {transcription && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {transcription}
              </div>
            )}
          </div>
        )}

        {tab === "search" && (
          <div className="grid gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                placeholder="Search routes, permits, RTO info, policy updates…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button className="button-primary" type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles size={18} />}
                Ask
              </button>
            </form>
            {searchResult && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {searchResult}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
