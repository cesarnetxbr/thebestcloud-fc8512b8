import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TrialBadgeProps {
  trialStartDate: string | null;
  trialEndDate: string | null;
  compact?: boolean;
}

const TrialBadge = ({ trialStartDate, trialEndDate, compact = false }: TrialBadgeProps) => {
  if (!trialStartDate || !trialEndDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(trialEndDate + "T00:00:00");
  const start = new Date(trialStartDate + "T00:00:00");
  const diffMs = end.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));

  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft > 0 && daysLeft <= 5;
  const isWarning = daysLeft > 5 && daysLeft <= 10;

  const badgeClass = isExpired
    ? "bg-destructive/20 text-destructive border-destructive/30"
    : isUrgent
    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
    : isWarning
    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    : "bg-blue-500/20 text-blue-400 border-blue-500/30";

  const label = isExpired
    ? "Trial expirado"
    : `${daysLeft}d restantes`;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`gap-1 text-xs ${badgeClass}`}>
              {isExpired || isUrgent ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Trial 30 dias free: {trialStartDate} → {trialEndDate}</p>
            <p>{isExpired ? "Período expirado! Altere a tabela de venda." : `Faltam ${daysLeft} dias para o fim do trial.`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${badgeClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExpired || isUrgent ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          <span className="text-sm font-semibold">30 Dias Free</span>
        </div>
        <span className="text-sm font-bold">{isExpired ? "Expirado" : `${daysLeft} dias restantes`}</span>
      </div>
      <div className="w-full bg-muted/30 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${isExpired ? "bg-destructive" : isUrgent ? "bg-orange-500" : isWarning ? "bg-yellow-500" : "bg-blue-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs opacity-80">
        <span>Início: {trialStartDate}</span>
        <span>Fim: {trialEndDate}</span>
      </div>
    </div>
  );
};

export default TrialBadge;
