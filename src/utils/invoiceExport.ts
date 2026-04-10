import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

interface InvoiceExportData {
  invoiceNumber: string;
  customerName: string;
  customerCnpj: string | null;
  customerRazaoSocial: string | null;
  tenantName: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  dueDate: string | null;
  status: string | null;
  items: {
    skuName: string;
    skuCode: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
  }[];
  type: "cost" | "sale";
}

export function exportInvoiceXLS(data: InvoiceExportData) {
  const label = data.type === "cost" ? "Custo" : "Venda";
  const total = data.items.reduce((s, i) => s + i.totalValue, 0);

  const infoRows = [
    ["Fatura", data.invoiceNumber],
    ["Tipo", label],
    ["Cliente", data.customerName],
    ["CNPJ", data.customerCnpj || "—"],
    ["Razão Social", data.customerRazaoSocial || "—"],
    ["Tenant", data.tenantName],
    ["Período", `${formatDate(data.periodStart)} — ${formatDate(data.periodEnd)}`],
    ["Emissão", formatDate(data.createdAt)],
    ["Vencimento", formatDate(data.dueDate)],
    ["Status", data.status || "DRAFT"],
    [],
    ["Item", "SKU", "Quantidade", `Preço Und.`, `Total`],
  ];

  const itemRows = data.items.map((i) => [
    i.skuName,
    i.skuCode,
    i.quantity,
    i.unitValue,
    i.totalValue,
  ]);

  const allRows = [...infoRows, ...itemRows, [], ["", "", "", "TOTAL", total]];

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Fatura ${label}`);
  XLSX.writeFile(wb, `fatura-${data.type}-${data.invoiceNumber}.xlsx`);
}

export function exportInvoicePDF(data: InvoiceExportData) {
  const label = data.type === "cost" ? "Custo" : "Venda";
  const total = data.items.reduce((s, i) => s + i.totalValue, 0);

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Fatura de ${label}`, 14, 20);

  doc.setFontSize(10);
  const info = [
    `Nº: ${data.invoiceNumber}`,
    `Cliente: ${data.customerName}`,
    `CNPJ: ${data.customerCnpj || "—"}`,
    `Razão Social: ${data.customerRazaoSocial || "—"}`,
    `Tenant: ${data.tenantName}`,
    `Período: ${formatDate(data.periodStart)} — ${formatDate(data.periodEnd)}`,
    `Emissão: ${formatDate(data.createdAt)}`,
    `Vencimento: ${formatDate(data.dueDate)}`,
    `Status: ${data.status || "DRAFT"}`,
  ];
  info.forEach((line, idx) => doc.text(line, 14, 30 + idx * 6));

  const startY = 30 + info.length * 6 + 6;

  autoTable(doc, {
    startY,
    head: [["Item", "SKU", "Qtd", "Preço Und.", "Total"]],
    body: data.items.map((i) => [
      i.skuName,
      i.skuCode,
      String(i.quantity),
      formatCurrency(i.unitValue),
      formatCurrency(i.totalValue),
    ]),
    foot: [["", "", "", "TOTAL", formatCurrency(total)]],
    theme: "striped",
    headStyles: { fillColor: [41, 128, 185] },
    footStyles: { fillColor: [236, 240, 241], textColor: [0, 0, 0], fontStyle: "bold" },
    styles: { fontSize: 9 },
  });

  doc.save(`fatura-${data.type}-${data.invoiceNumber}.pdf`);
}
