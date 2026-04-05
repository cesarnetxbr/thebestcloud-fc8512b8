import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X, Cookie, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CookiePrefs = { essential: boolean; analytics: boolean; marketing: boolean };

const STORAGE_KEY = "cookie_consent";

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const saveConsent = async (consent: CookiePrefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);

    try {
      await supabase.from("lgpd_consent_records").insert({
        user_identifier: crypto.randomUUID(),
        consent_type: "cookies",
        granted: consent.analytics || consent.marketing,
        ip_address: null,
        user_agent: navigator.userAgent.substring(0, 200),
        details: consent as any,
      });
    } catch {
      // silent
    }
  };

  const acceptAll = () => saveConsent({ essential: true, analytics: true, marketing: true });
  const rejectAll = () => saveConsent({ essential: true, analytics: false, marketing: false });
  const saveCustom = () => saveConsent(prefs);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="container mx-auto max-w-4xl bg-background border border-border rounded-xl shadow-lg p-5">
        <div className="flex items-start gap-3">
          <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Controle de Privacidade e Cookies</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Utilizamos cookies para melhorar sua experiência. Cookies essenciais são necessários para o funcionamento do site.
              Cookies de análise e marketing são opcionais. Saiba mais em nossa{" "}
              <Link to="/cookies" className="text-primary hover:underline">Política de Cookies</Link> e{" "}
              <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
            </p>

            {showDetails && (
              <div className="space-y-2 mb-3 text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span className="font-medium">Essenciais</span>
                  <span className="text-muted-foreground">— Necessários (sempre ativos)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={prefs.analytics} onChange={e => setPrefs(p => ({ ...p, analytics: e.target.checked }))} className="rounded" />
                  <span className="font-medium">Análise</span>
                  <span className="text-muted-foreground">— Google Analytics, Hotjar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={prefs.marketing} onChange={e => setPrefs(p => ({ ...p, marketing: e.target.checked }))} className="rounded" />
                  <span className="font-medium">Marketing</span>
                  <span className="text-muted-foreground">— Facebook Pixel</span>
                </label>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={acceptAll}>Aceitar Todos</Button>
              <Button size="sm" variant="outline" onClick={rejectAll}>Recusar Opcionais</Button>
              {showDetails ? (
                <Button size="sm" variant="secondary" onClick={saveCustom}>Salvar Preferências</Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setShowDetails(true)}>
                  <Settings2 className="h-3.5 w-3.5 mr-1" /> Personalizar
                </Button>
              )}
            </div>
          </div>
          <button onClick={rejectAll} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
