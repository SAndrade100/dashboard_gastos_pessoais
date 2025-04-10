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

  // Novo estado para controlar visualização do formulário em dispositivos móveis
  const [showMobileForm, setShowMobileForm] = useState(false);
  
  // Função para detectar se estamos em um dispositivo móvel
  const isMobile = () => window.innerWidth <= 767;

  return (
    <div className="dashboard">
      <div className="container">
        <header>
          <h1>Dashboard de Gastos Financeiros</h1>
          <p>Acompanhe e gerencie seus gastos mensais e anuais</p>
        </header>
        
        {/* Botão de adicionar visível apenas em dispositivos móveis */}
        {isMobile() && (
          <div className="mobile-actions mb-4">
            <button 
              className="bg-blue-500 mobile-add-button" 
              onClick={() => setShowMobileForm(!showMobileForm)}
            >
              {showMobileForm ? 'Fechar formulário' : '+ Adicionar despesa'}
            </button>
          </div>
        )}
        
        {/* Layout principal - Grid com sidebar e área principal */}
        <div className="grid md:grid-cols-3">
          {/* Sidebar - Formulário e filtros - Condicionalmente mostrado em mobile */}
          <div className={`md:col-span-1 ${isMobile() && !showMobileForm ? 'mobile-hidden' : ''}`}>
            {/* Painel de adicionar despesa */}
            <div className="card mb-6 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <PlusCircle className="mr-2" size={20} /> Adicionar Despesa
              </h2>
              <form onSubmit={addExpense}>
                <div className="mb-4">
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0.01"
                  />
                </div>
                
                <div className="mb-4">
                  <label>Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label>Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                  className="bg-blue-500"
                >
                  Adicionar
                </button>
              </form>
            </div>
            
            {/* Painel de filtros */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="mr-2" size={20} /> Filtros
              </h2>
              
              <div className="mb-4 view-selector">
                <label>Visualização</label>
                <div className="flex view-toggle">
                  <button
                    className={`flex-1 ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                  >
                    Mensal
                  </button>
                  <button
                    className={`flex-1 ${viewMode === 'year' ? 'active' : ''}`}
                    onClick={() => setViewMode('year')}
                  >
                    Anual
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label>Ano</label>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(parseInt(e.target.value))}
                >
                  {[2023, 2024, 2025].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {viewMode === 'month' && (
                <div className="mb-4">
                  <label>Mês</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(parseInt(e.target.value))}
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
                className="bg-blue-500 flex items-center justify-center"
              >
                <Download className="mr-2" size={18} /> Exportar Gráfico
              </button>
            </div>
          </div>
          
          {/* Área principal - Gráficos e tabela */}
          <div className="md:col-span-2">
            {/* Painel do gráfico */}
            <div className="card p-6 mb-6">
              <div className="flex justify-between items-center mb-6 expense-total">
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
                <div className="h-64 mb-6" ref={chartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    {viewMode === 'month' ? (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="amount" fill="#0047AB" name="Valor" />
                      </BarChart>
                    ) : (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#0047AB" name="Total Mensal" />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="no-data-message">
                  Sem dados para exibir. Adicione despesas para visualizar o gráfico.
                </div>
              )}
            </div>
            
            {/* Painel de lista de despesas */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="mr-2" size={20} /> Lista de Despesas
              </h2>
              
              <div className="table-container">
                <table className={isMobile() ? 'mobile-card-layout' : ''}>
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Data</th>
                      <th className="text-right">Valor</th>
                      <th className="action-column"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map(expense => (
                        <tr key={expense.id}>
                          <td data-label="Descrição">{expense.description}</td>
                          <td data-label="Categoria">{expense.category}</td>
                          <td data-label="Data">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                          <td data-label="Valor" className="text-right">R$ {expense.amount.toFixed(2)}</td>
                          <td>
                            <button 
                              onClick={() => removeExpense(expense.id)}
                              className="delete-btn"
                              title="Remover"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-message">
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