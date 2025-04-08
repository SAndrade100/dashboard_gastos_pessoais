import { useState, useEffect } from 'react';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, PlusCircle, Calendar, DollarSign, FileText, Trash2 } from 'lucide-react';

export default function FinancialDashboard() {
  // Estado para armazenar os dados financeiros
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('financialExpenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  
  // Estados para o formulário de adição de despesas
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [category, setCategory] = useState('Alimentação');
  
  // Estado para filtros
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState('month'); // 'month' ou 'year'
  
  // Salvar dados no localStorage sempre que forem atualizados
  useEffect(() => {
    localStorage.setItem('financialExpenses', JSON.stringify(expenses));
  }, [expenses]);
  
  // Adicionar nova despesa
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
    
    // Reset form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().substr(0, 10));
    setCategory('Alimentação');
  };
  
  // Remover despesa
  const removeExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };
  
  // Filtrar despesas por ano e mês
  const filteredExpenses = expenses.filter(expense => {
    if (viewMode === 'month') {
      return expense.year === yearFilter && expense.month === monthFilter;
    } else {
      return expense.year === yearFilter;
    }
  });
  
  // Calcular total de despesas
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Preparar dados para gráficos mensais
  const monthlyChartData = viewMode === 'month' 
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
  
  // Função para obter nome do mês
  function getMonthName(month) {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return monthNames[month - 1];
  }
  
  // Gerar PDF com jsPDF (simulado - apenas exibe mensagem)
  const generatePDF = () => {
    alert('Relatório PDF gerado com sucesso! Em uma implementação real, isso baixaria um arquivo PDF.');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard de Gastos Financeiros</h1>
          <p className="text-gray-600">Acompanhe e gerencie seus gastos mensais e anuais</p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Painel esquerdo - Formulário e filtros */}
          <div className="md:col-span-1">
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
                    <option>Outros</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </form>
            </div>
            
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
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <button
                onClick={generatePDF}
                className="w-full flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              >
                <Download className="mr-2" size={18} /> Exportar PDF
              </button>
            </div>
          </div>
          
          {/* Painel direito - Gráficos e lista de despesas */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <DollarSign className="mr-2" size={20} /> 
                  {viewMode === 'month' 
                    ? `Despesas de ${getMonthName(monthFilter)}/${yearFilter}` 
                    : `Despesas de ${yearFilter}`}
                </h2>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {totalExpenses.toFixed(2)}
                </div>
              </div>
              
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'month' ? (
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="amount" fill="#3b82f6" name="Valor" />
                    </BarChart>
                  ) : (
                    <LineChart data={monthlyChartData}>
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
            </div>
            
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
                      <th className="pb-3"></th>
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