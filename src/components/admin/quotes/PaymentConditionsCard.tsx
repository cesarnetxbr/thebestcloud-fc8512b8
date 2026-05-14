import { useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles, Calendar, AlertTriangle, Link as LinkIcon, Trash2, Plus } from "lucide-react";

export type PaymentMethod = "a_vista" | "faturado";
export type DiscountType = "percent" | "value";
export type InstallmentsPlan = "30" | "60" | "90" | "30_60" | "30_60_90" | "custom";
export type PaymentStatus = "aguardando" | "pago" | "faturado" | "parcial";

const INSTALLMENTS_PLAN_NONE = "__none__";

export interface Installment {
  n: number;
  due_date: string; // YYYY-MM-DD
  amount: number;
}

interface Props {
  totalValue: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;
  discountType: DiscountType | null;
  setDiscountType: (v: DiscountType | null) => void;
  discountValue: number;
  setDiscountValue: (v: number) => void;
  installmentsPlan: InstallmentsPlan | null;
  setInstallmentsPlan: (v: InstallmentsPlan | null) => void;
  installments: Installment[];
  setInstallments: (v: Installment[]) => void;
  finalValue: number;
  setFinalValue: (v: number) => void;
  paymentStatus: PaymentStatus;
  setPaymentStatus: (v: PaymentStatus) => void;
  paymentLink: string;
  setPaymentLink: (v: string) => void;
}

export const formatBRL = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PLAN_DAYS: Record<Exclude<InstallmentsPlan, "custom">, number[]> = {
  "30": [30],
  "60": [60],
  "90": [90],
  "30_60": [30, 60],
  "30_60_90": [30, 60, 90],
};

export const calcDiscountAmount = (total: number, type: DiscountType | null, value: number) => {
  if (!type || !value) return 0;
  if (type === "percent") return Math.max(0, Math.min(total, (total * value) / 100));
  return Math.max(0, Math.min(total, value));
};

export const buildInstallments = (final: number, plan: InstallmentsPlan | null): Installment[] => {
  if (!plan || plan === "custom") return [];
  const days = PLAN_DAYS[plan];
  const base = Math.round((final / days.length) * 100) / 100;
  const today = new Date();
  return days.map((d, i) => {
    const due = new Date(today);
    due.setDate(due.getDate() + d);
    let amount = base;
    if (i === days.length - 1) {
      // ajusta última parcela para fechar a soma exata
      amount = Math.round((final - base * (days.length - 1)) * 100) / 100;
    }
    return { n: i + 1, due_date: due.toISOString().slice(0, 10), amount };
  });
};

export default function PaymentConditionsCard(props: Props) {
  const {
    totalValue, paymentMethod, setPaymentMethod, discountType, setDiscountType,
    discountValue, setDiscountValue, installmentsPlan, setInstallmentsPlan,
    installments, setInstallments, finalValue, setFinalValue,
    paymentStatus, setPaymentStatus, paymentLink, setPaymentLink,
  } = props;

  const discountAmount = useMemo(
    () => (paymentMethod === "a_vista" ? calcDiscountAmount(totalValue, discountType, discountValue) : 0),
    [paymentMethod, totalValue, discountType, discountValue],
  );
  const computedFinal = Math.max(0, totalValue - discountAmount);

  // Sincroniza final_value automaticamente (apenas quando muda)
  useEffect(() => {
    if (Math.abs((finalValue || 0) - computedFinal) > 0.001) {
      setFinalValue(computedFinal);
    }
  }, [computedFinal, finalValue, setFinalValue]);

  // Recalcula parcelas ao trocar plano (exceto custom).
  // Preserva as parcelas já carregadas do banco no primeiro render.
  const skipFirstPlanEffect = useRef(installments.length > 0);
  useEffect(() => {
    if (paymentMethod !== "faturado") return;
    if (!installmentsPlan || installmentsPlan === "custom") return;
    if (skipFirstPlanEffect.current) {
      skipFirstPlanEffect.current = false;
      return;
    }
    setInstallments(buildInstallments(computedFinal, installmentsPlan));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installmentsPlan, computedFinal, paymentMethod]);

  const installmentsSum = installments.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const sumMismatch = paymentMethod === "faturado" && installments.length > 0
    && Math.abs(installmentsSum - computedFinal) > 0.01;

  const updateInstallment = (idx: number, patch: Partial<Installment>) => {
    const next = installments.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    setInstallments(next);
  };
  const addInstallment = () => {
    const last = installments[installments.length - 1];
    const nextDate = new Date(last?.due_date || new Date().toISOString().slice(0, 10));
    nextDate.setDate(nextDate.getDate() + 30);
    setInstallments([
      ...installments,
      { n: installments.length + 1, due_date: nextDate.toISOString().slice(0, 10), amount: 0 },
    ]);
    setInstallmentsPlan("custom");
  };
  const removeInstallment = (idx: number) => {
    const next = installments.filter((_, i) => i !== idx).map((it, i) => ({ ...it, n: i + 1 }));
    setInstallments(next);
    setInstallmentsPlan("custom");
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Condições de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="a_vista">À Vista</TabsTrigger>
            <TabsTrigger value="faturado">Faturado</TabsTrigger>
          </TabsList>
        </Tabs>

        {paymentMethod === "a_vista" && (
          <div className="space-y-3">
            <div className="rounded-md bg-accent/10 border border-accent/30 p-3 text-sm font-medium text-accent flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Desconto especial para pagamento à vista
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Tipo de desconto</Label>
                <Select
                  value={discountType ?? "percent"}
                  onValueChange={(v) => setDiscountType(v as DiscountType)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentual (%)</SelectItem>
                    <SelectItem value="value">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor do desconto</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={discountValue || ""}
                  onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                  placeholder={discountType === "value" ? "0,00" : "0"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Valor original</p>
                <p className="text-lg font-semibold">{formatBRL(totalValue)}</p>
              </div>
              <div className="rounded-md border p-3 bg-destructive/5">
                <p className="text-xs text-muted-foreground">Desconto aplicado</p>
                <p className="text-lg font-semibold text-destructive">- {formatBRL(discountAmount)}</p>
              </div>
              <div className="rounded-md border-2 border-accent p-3 bg-accent/5">
                <p className="text-xs text-muted-foreground">Valor final com desconto</p>
                <p className="text-xl font-bold text-accent">{formatBRL(computedFinal)}</p>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "faturado" && (
          <div className="space-y-3">
            <div>
              <Label>Plano de parcelamento</Label>
              <Select
                value={installmentsPlan ?? INSTALLMENTS_PLAN_NONE}
                onValueChange={(v) => setInstallmentsPlan(v === INSTALLMENTS_PLAN_NONE ? null : (v as InstallmentsPlan))}
              >
                <SelectTrigger><SelectValue placeholder="Selecione um plano" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={INSTALLMENTS_PLAN_NONE}>Selecione um plano</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="30_60">30 / 60 dias</SelectItem>
                  <SelectItem value="30_60_90">30 / 60 / 90 dias</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {installments.length > 0 && (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Parcela</TableHead>
                      <TableHead><Calendar className="h-3 w-3 inline mr-1" />Vencimento</TableHead>
                      <TableHead className="text-right">Valor (R$)</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installments.map((inst, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{inst.n}/{installments.length}</TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={inst.due_date}
                            onChange={(e) => updateInstallment(idx, { due_date: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="text-right"
                            value={inst.amount}
                            onChange={(e) => {
                              updateInstallment(idx, { amount: Number(e.target.value) || 0 });
                              setInstallmentsPlan("custom");
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeInstallment(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2 text-sm">
                  <Button type="button" variant="ghost" size="sm" onClick={addInstallment}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar parcela
                  </Button>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">Soma das parcelas:</span>
                    <span className={sumMismatch ? "font-bold text-destructive" : "font-bold"}>
                      {formatBRL(installmentsSum)}
                    </span>
                  </div>
                </div>
                {sumMismatch && (
                  <div className="bg-destructive/10 text-destructive text-xs px-3 py-2 flex items-center gap-2 border-t">
                    <AlertTriangle className="h-3 w-3" />
                    A soma das parcelas ({formatBRL(installmentsSum)}) deve ser igual ao valor final ({formatBRL(computedFinal)}).
                  </div>
                )}
              </div>
            )}

            <div className="rounded-md border-2 border-primary p-3 bg-primary/5 flex items-center justify-between">
              <span className="text-sm font-medium">Valor total faturado</span>
              <span className="text-xl font-bold text-primary">{formatBRL(computedFinal)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <Label>Status do pagamento</Label>
            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aguardando">Aguardando pagamento</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="faturado">Faturado</SelectItem>
                <SelectItem value="parcial">Parcialmente pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Link de pagamento</Label>
            <Input
              type="url"
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
