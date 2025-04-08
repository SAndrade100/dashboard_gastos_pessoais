import { useState, useEffect, useRef } from 'react';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, PlusCircle, Calendar, DollarSign, FileText, Trash2, BarChart2 } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './App.css';

export default function FinancialDashboard() {
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('financialExpenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [category, setCategory] = useState('Alimentação');
  
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState('month'); 
  
  useEffect(() => {
    localStorage.setItem('financialExpenses', JSON.stringify(expenses));
  }, [expenses]);
  
  const chartRef = useRef(null);

  const addExpense = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;
    
    const newExpense = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      date,
      category,
      year: parseInt(date.split('-')[0]),
      month: parseInt(date.split('-')[1])
    };
    
    setExpenses([...expenses, newExpense]);
    
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().substr(0, 10));
    setCategory('Alimentação');
  };
  
  const removeExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };
  
  const filteredExpenses = expenses.filter(expense => {
    if (viewMode === 'month') {
      return expense.year === yearFilter && expense.month === monthFilter;
    } else {
      return expense.year === yearFilter;
    }
  });
  
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const chartData = viewMode === 'month' 
    ? filteredExpenses.reduce((acc, expense) => {
        const category = expense.category;
        const existingCategory = acc.find(item => item.category === category);
        
        if (existingCategory) {
          existingCategory.amount += expense.amount;
        } else {
          acc.push({ category, amount: expense.amount });
        }
        
        return acc;
      }, [])
    : Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthExpenses = expenses.filter(e => e.year === yearFilter && e.month === month);
        const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        return { month: getMonthName(month), amount: total };
      });
  
  function getMonthName(month) {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return monthNames[month - 1];
  }

  function getFullMonthName(month) {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                         'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return monthNames[month - 1];
  }
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
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
    
    if (chartData.length > 0 && viewMode === 'month') {
      const startY = doc.previousAutoTable.finalY + 15;
      
      doc.setFontSize(14);
      doc.text("Resumo por Categoria", 14, startY);
      
      const categoryColumns = ["Categoria", "Valor (R$)", "% do Total"];
      const categoryRows = chartData.map(item => [
        item.category,
        item.amount.toFixed(2),
        ((item.amount / totalExpenses) * 100).toFixed(1) + "%"
      ]);
      
      autoTable(doc, {
        head: [categoryColumns],
        body: categoryRows,
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
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' }
        }
      });
    }
    
    if (viewMode === 'year') {
      const startY = doc.previousAutoTable.finalY + 15;
      
      doc.setFontSize(14);
      doc.text("Resumo Mensal", 14, startY);
      
      const monthlyColumns = ["Mês", "Valor (R$)"];
      const monthlyRows = chartData
        .filter(item => item.amount > 0) 
        .map(item => [
          item.month,
          item.amount.toFixed(2)
        ]);
      
      autoTable(doc, {
        head: [monthlyColumns],
        body: monthlyRows,
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
        columnStyles: {
          1: { halign: 'right' }
        }
      });
    }
    
    const pageCount = doc.internal.getNumberOfPages();
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

  const generateChartPDF = async () => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard de Gastos Financeiros</h1>
          <p className="text-gray-600">Acompanhe e gerencie seus gastos mensais e anuais</p>
        </header>
        
        {/* Layout principal - Grid com sidebar e área principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Formulário e filtros */}
          <div className="lg:col-span-1">
            {/* Painel de adicionar despesa */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <PlusCircle className="mr-2" size={20} /> Adicionar Despesa
              </h2>
              <form onSubmit={addExpense}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    min="0.01"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option>Alimentação</option>
                    <option>Transporte</option>
                    <option>Moradia</option>
                    <option>Saúde</option>
                    <option>Educação</option>
                    <option>Lazer</option>
                    <option>Vestuário</option>
                    <option>Serviços</option>
                    <option>Outros</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Adicionar
                </button>
              </form>
            </div>
            
            {/* Painel de filtros */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="mr-2" size={20} /> Filtros
              </h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Visualização</label>
                <div className="flex rounded-md overflow-hidden border">
                  <button
                    className={`flex-1 py-2 ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setViewMode('month')}
                  >
                    Mensal
                  </button>
                  <button
                    className={`flex-1 py-2 ${viewMode === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setViewMode('year')}
                  >
                    Anual
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Ano</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {[2023, 2024, 2025].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {viewMode === 'month' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Mês</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {getFullMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <button
                onClick={generateChartPDF}
                className="w-full flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                <Download className="mr-2" size={18} /> Exportar Gráfico
              </button>
            </div>
          </div>
          
          {/* Área principal - Gráficos e tabela */}
          <div className="lg:col-span-3">
            {/* Painel do gráfico */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <DollarSign className="mr-2" size={20} /> 
                  {viewMode === 'month' 
                    ? `Despesas de ${getFullMonthName(monthFilter)} de ${yearFilter}` 
                    : `Despesas de ${yearFilter}`}
                </h2>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {totalExpenses.toFixed(2)}
                </div>
              </div>
              
              {chartData.length > 0 ? (
                <div className="h-72 mb-6" ref={chartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    {viewMode === 'month' ? (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="amount" fill="#3b82f6" name="Valor" />
                      </BarChart>
                    ) : (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Total Mensal" />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-72 text-gray-500">
                  Sem dados para exibir. Adicione despesas para visualizar o gráfico.
                </div>
              )}
            </div>
            
            {/* Painel de lista de despesas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="mr-2" size={20} /> Lista de Despesas
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3">Descrição</th>
                      <th className="pb-3">Categoria</th>
                      <th className="pb-3">Data</th>
                      <th className="pb-3 text-right">Valor</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map(expense => (
                        <tr key={expense.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{expense.description}</td>
                          <td>{expense.category}</td>
                          <td>{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                          <td className="text-right">R$ {expense.amount.toFixed(2)}</td>
                          <td className="text-right">
                            <button 
                              onClick={() => removeExpense(expense.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Remover"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-500">
                          Nenhuma despesa encontrada para o período selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}