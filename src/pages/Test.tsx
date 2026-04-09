import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { sendChatMessage } from "../services/api";
import { Send } from "lucide-react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export default function Test() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-assistant",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prompt = input.trim();
    if (!prompt || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const result = await sendChatMessage(prompt);
      if (!result.success) {
        throw new Error(result.message || "Failed to generate response.");
      }

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: result.reply || "No response generated.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while contacting Gemini.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex h-[calc(100vh-3rem)] w-full max-w-md flex-col overflow-hidden rounded-md border bg-white/80 backdrop-blur-sm">
        <header className="border-b border-blue-200 bg-linear-to-r from-blue-100 via-sky-50 to-blue-100 px-5 py-4 md:px-6">
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-900 md:text-3xl">
            Chat Bot
          </h1>
        </header>

        <section className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-md px-4 py-3 text-sm leading-relaxed shadow-sm md:max-w-[75%] md:text-base ${
                  m.role === "user"
                    ? "bg-blue-700 text-white"
                    : "border border-blue-100 bg-white text-blue-900"
                }`}
              >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] opacity-70">
                  {m.role === "user" ? "You" : "Assistant"}
                </p>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-blue-500">
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:120ms]" />
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:240ms]" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {error && (
          <div className="mx-4 mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 md:mx-6">
            {error}
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="border-t border-blue-200 bg-white/85 px-4 py-4 md:px-6"
        >
          <div className="flex items-end gap-2 md:gap-3">
            <textarea
              className="min-h-13 flex-1 resize-none rounded-md border border-blue-200 bg-white px-4 py-3 text-sm text-blue-900 shadow-inner outline-none transition focus:border-blue-500 md:text-base"
              value={input}
              placeholder="Type your message..."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-13 rounded-md bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-200"
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
