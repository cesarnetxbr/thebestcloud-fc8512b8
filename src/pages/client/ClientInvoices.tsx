import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const ClientInvoices = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Faturas & Boletos</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Suas Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Em breve</p>
            <p className="text-sm">O download de boletos e notas fiscais estará disponível em breve.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientInvoices;
