import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Shield, HardDrive, Settings, BookOpen, ExternalLink,
  FileText, Video, HelpCircle, AlertTriangle, Monitor,
  RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { useState, useMemo } from "react";
import { articles, categories } from "@/data/knowledgeBase";
import KBSmartSearch from "@/components/KBSmartSearch";

const categoryIcons: Record<string, typeof BookOpen> = {
  todos: BookOpen,
  Segurança: Shield,
  Proteção: HardDrive,
  Operação: Settings,
};

const categoryColors: Record<string, string> = {
  todos: "text-primary",
  Segurança: "text-destructive",
  Proteção: "text-blue-500",
  Operação: "text-green-500",
};

const typeIcons: Record<string, typeof BookOpen> = {
  guia: FileText,
  video: Video,
  faq: HelpCircle,
  troubleshooting: AlertTriangle,
};

const typeLabels: Record<string, string> = {
  guia: "Guia",
  video: "Vídeo",
  faq: "FAQ",
  troubleshooting: "Solução de Problemas",
};

const typeBadgeVariant: Record<string, string> = {
  guia: "bg-blue-100 text-blue-800",
  video: "bg-purple-100 text-purple-800",
  faq: "bg-amber-100 text-amber-800",
  troubleshooting: "bg-red-100 text-red-800",
};

const KnowledgeBase = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = activeCategory === "todos" || a.category === activeCategory;
      if (!matchCat) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q)) ||
        a.subcategory.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  // When searching, auto-switch to "todos" for better UX
  const handleSearch = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      setActiveCategory("todos");
    }
  };

  const stats = useMemo(() => ({
    total: articles.length,
    seguranca: articles.filter((a) => a.category === "Segurança").length,
    protecao: articles.filter((a) => a.category === "Proteção").length,
    operacao: articles.filter((a) => a.category === "Operação").length,
  }), []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Base de Conhecimento
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-8">
            Documentação técnica completa, guias práticos e respostas para as dúvidas mais comuns sobre nossas soluções de ciberproteção — tudo em Português.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar artigos, guias, soluções..."
              className="pl-10 h-12 text-base"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* AI Smart Search */}
          <div className="mt-8">
            <KBSmartSearch />
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Artigos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{stats.seguranca}</p>
              <p className="text-sm text-muted-foreground">Segurança</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.protecao}</p>
              <p className="text-sm text-muted-foreground">Proteção</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.operacao}</p>
              <p className="text-sm text-muted-foreground">Operação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-8 flex flex-wrap h-auto gap-2">
            {categories.map((c) => {
              const Icon = categoryIcons[c.id] || BookOpen;
              const color = categoryColors[c.id] || "text-primary";
              return (
                <TabsTrigger key={c.id} value={c.id} className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  {c.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Nenhum artigo encontrado.</p>
                  <p className="text-sm text-muted-foreground">Tente outros termos de pesquisa.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    {filtered.length} artigo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                    {search && ` para "${search}"`}
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((article, i) => {
                      const TypeIcon = typeIcons[article.type];
                      const isExpanded = expandedArticle === i;
                      return (
                        <Card key={i} className="group hover:shadow-lg transition-shadow border-border/50 flex flex-col">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <Badge variant="outline" className={`text-xs ${typeBadgeVariant[article.type]}`}>
                                <TypeIcon className="h-3 w-3 mr-1" />
                                {typeLabels[article.type]}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {article.subcategory}
                              </Badge>
                            </div>
                            <CardTitle className="text-base leading-snug mt-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                              {article.description}
                            </p>

                            {/* Expandable content */}
                            {article.content && (
                              <div className="mb-3">
                                <button
                                  onClick={() => setExpandedArticle(isExpanded ? null : i)}
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  {isExpanded ? "Recolher" : "Ver conteúdo"}
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>
                                {isExpanded && (
                                  <div className="mt-3 p-4 bg-muted/50 rounded-lg text-sm text-foreground/80 whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto">
                                    {article.content}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="mt-auto">
                              <div className="flex flex-wrap gap-1 mb-3">
                                {article.tags.slice(0, 4).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-[10px] text-muted-foreground cursor-pointer hover:bg-primary/10"
                                    onClick={() => handleSearch(tag)}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              {article.externalUrl && (
                                <a
                                  href={article.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  Ver documentação oficial
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Links */}
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Links Úteis</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: "https://www.acronis.com/support/documentation/CyberProtectionService/",
                icon: BookOpen,
                title: "Guia Cyber Protect Cloud",
                desc: "Documentação completa",
              },
              {
                href: "https://www.acronis.com/support/documentation/AcronisCyberCloud/",
                icon: Monitor,
                title: "Console de Gerenciamento",
                desc: "Guia do administrador",
              },
              {
                href: "https://www.acronis.com/support/documentation/DisasterRecovery/",
                icon: RefreshCw,
                title: "Disaster Recovery",
                desc: "Guia de DR na nuvem",
              },
              {
                href: "https://kb.acronis.com/",
                icon: HelpCircle,
                title: "Knowledge Base Acronis",
                desc: "Base oficial de suporte",
              },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{link.title}</p>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KnowledgeBase;
