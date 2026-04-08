import { useState, useRef } from "react";
import { Bot, Send, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { articles } from "@/data/knowledgeBase";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kb-ai-search`;

export default function KBSmartSearch() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || q.length < 3) return;

    setLoading(true);
    setAnswer("");

    abortRef.current = new AbortController();

    try {
      // Send top-relevant articles as context (send all, backend will truncate)
      const contextArticles = articles.map((a) => ({
        title: a.title,
        category: a.category,
        subcategory: a.subcategory,
        description: a.description,
        content: a.content || "",
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ question: q, articles: contextArticles }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
        toast.error(err.error || "Erro ao consultar a IA");
        setLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              result += content;
              setAnswer(result);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error(e);
        toast.error("Erro ao conectar com a IA");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="gap-2"
        variant="default"
        size="lg"
      >
        <Sparkles className="h-5 w-5" />
        Perguntar à IA
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-background shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">Assistente IA - Base de Conhecimento</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { setOpen(false); handleCancel(); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ex: Como configurar backup para Microsoft 365? Como funciona a proteção anti-ransomware?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={loading ? handleCancel : handleAsk}
            disabled={!loading && question.trim().length < 3}
            size="icon"
            className="shrink-0 h-[60px] w-[60px]"
            variant={loading ? "destructive" : "default"}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>

        {answer && (
          <div className="rounded-lg bg-muted/50 p-4 max-h-[400px] overflow-y-auto">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
            </div>
          </div>
        )}

        {!answer && !loading && (
          <p className="text-xs text-muted-foreground text-center">
            Faça uma pergunta sobre nossas soluções de ciberproteção. A IA responderá com base nos artigos da base de conhecimento.
          </p>
        )}
      </div>
    </Card>
  );
}
