import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { getFullMonthName } from './dateHelpers';
import { RefObject } from 'react';

interface Expense {
  description: string;
  category: string;
  date: string;
  amount: number;
}

interface ChartDataMonth {
  month: string;
  amount: number;
}

interface ChartDataCategory {
  category: string;
  amount: number;
}

type ChartData = ChartDataMonth | ChartDataCategory;

interface CustomJsPDF extends jsPDF {
  previousAutoTable?: {
    finalY: number;
  };
}

export const generatePDF = (
  viewMode: 'month' | 'year',
  monthFilter: number,
  yearFilter: number,
  filteredExpenses: Expense[],
  totalExpenses: number,
  chartData: ChartData[]
): void => {
  const doc = new jsPDF() as CustomJsPDF;
  
  const title = viewMode === 'month' 
    ? `Relatório de Despesas - ${getFullMonthName(monthFilter)} de ${yearFilter}`
    : `Relatório Anual de Despesas - ${yearFilter}`;
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`Total de despesas: R$ ${totalExpenses.toFixed(2)}`, 14, 40);
  
  const tableColumn = ["Descrição", "Categoria", "Data", "Valor (R$)"];
  const tableRows = filteredExpenses.map(expense => [
    expense.description,
    expense.category,
    new Date(expense.date).toLocaleDateString('pt-BR'),
    expense.amount.toFixed(2)
  ]);
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 50,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [0, 71, 171],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      3: { halign: 'right' }
    }
  });
  
  if (chartData.length > 0) {
    const startY = (doc.previousAutoTable?.finalY ?? 0) + 15;
    
    doc.setFontSize(14);
    doc.text(viewMode === 'month' ? "Resumo por Categoria" : "Resumo Mensal", 14, startY);
    
    const summaryColumns = viewMode === 'month' 
      ? ["Categoria", "Valor (R$)", "% do Total"]
      : ["Mês", "Valor (R$)"];
      
    const summaryRows = viewMode === 'month'
      ? chartData.map(item => [
          (item as ChartDataCategory).category,
          item.amount.toFixed(2),
          ((item.amount / totalExpenses) * 100).toFixed(1) + "%"
        ])
      : chartData.filter(item => item.amount > 0).map(item => [
          (item as ChartDataMonth).month,
          item.amount.toFixed(2)
        ]);
    
    autoTable(doc, {
      head: [summaryColumns],
      body: summaryRows,
      startY: startY + 10,
      theme: 'grid',
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [46, 139, 87],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: viewMode === 'month'
        ? {
            1: { halign: 'right' },
            2: { halign: 'right' }
          }
        : {
            1: { halign: 'right' }
          }
    });
  }
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Página ${i} de ${pageCount} - Dashboard de Gastos Financeiros`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`relatorio-gastos-${viewMode === 'month' ? 
    `${monthFilter}-${yearFilter}` : 
    yearFilter}.pdf`);
};

export const generateChartPDF = async (
  chartRef: RefObject<HTMLDivElement>,
  viewMode: 'month' | 'year',
  monthFilter: number,
  yearFilter: number,
  totalExpenses: number
): Promise<void> => {
  if (!chartRef.current) return;
  
  try {
    const title = viewMode === 'month' 
      ? `Gráfico de Despesas - ${getFullMonthName(monthFilter)} de ${yearFilter}`
      : `Gráfico Anual de Despesas - ${yearFilter}`;
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const canvas = await html2canvas(chartRef.current, {
      scale: 2,
      backgroundColor: '#FFFFFF',
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    doc.setFontSize(18);
    doc.text(title, 15, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Total: R$ ${totalExpenses.toFixed(2)} • Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 30);
    
    const imgWidth = 270;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    doc.addImage(imgData, 'PNG', 15, 40, imgWidth, imgHeight);
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      'Dashboard de Gastos Financeiros',
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    
    doc.save(`grafico-gastos-${viewMode === 'month' ? 
      `${monthFilter}-${yearFilter}` : 
      yearFilter}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar o PDF do gráfico:", error);
    alert("Não foi possível gerar o PDF do gráfico. Tente novamente.");
  }
};