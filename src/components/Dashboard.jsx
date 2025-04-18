import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [showForm, setShowForm] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    category: 'Alimentação',
    amount: '',
    type: 'expense'
  });
  
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2023-08-15', description: 'Supermercado', amount: -120.50, category: 'Alimentação' },
    { id: 2, date: '2023-08-14', description: 'Salário', amount: 3000.00, category: 'Receita' },
    { id: 3, date: '2023-08-10', description: 'Conta de Luz', amount: -85.20, category: 'Moradia' },
    { id: 4, date: '2023-08-05', description: 'Restaurante', amount: -62.30, category: 'Alimentação' },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm({
      ...transactionForm,
      [name]: value
    });
  };

  const handleAmountChange = (e) => {
    let value = e.target.value;
    
    value = value.replace(/[^\d.-]/g, '');
    
    setTransactionForm({
      ...transactionForm,
      amount: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalAmount = parseFloat(transactionForm.amount);
    if (transactionForm.type === 'expense') {
      finalAmount = -Math.abs(finalAmount);
    } else {
      finalAmount = Math.abs(finalAmount);
    }
    
    const newTransaction = {
      id: Date.now(),
      date: transactionForm.date,
      description: transactionForm.description,
      category: transactionForm.category,
      amount: finalAmount
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    setTransactionForm({
      date: new Date().toISOString().slice(0, 10),
      description: '',
      category: 'Alimentação',
      amount: '',
      type: 'expense'
    });
    
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const categories = [
    'Alimentação', 'Moradia', 'Transporte', 'Saúde', 
    'Educação', 'Lazer', 'Vestuário', 'Receita', 'Outros'
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <header>
          <h1>Dashboard de Gastos Pessoais</h1>
          <p>Bem-vindo, {currentUser.name}! Gerencie suas finanças de forma simples e eficiente.</p>
        </header>
        
        <div className="grid">
          <div className="sidebar">
            <h2 className="text-xl font-semibold mb-4">Menu</h2>
            <nav>
              <ul>
                <li>
                  <button 
                    className={activeTab === 'overview' ? 'btn-primary' : ''} 
                    onClick={() => setActiveTab('overview')}
                  >
                    Visão Geral
                  </button>
                </li>
                <li>
                  <button 
                    className={activeTab === 'transactions' ? 'btn-primary' : ''} 
                    onClick={() => setActiveTab('transactions')}
                  >
                    Transações
                  </button>
                </li>
                <li>
                  <button 
                    className={activeTab === 'budget' ? 'btn-primary' : ''} 
                    onClick={() => setActiveTab('budget')}
                  >
                    Orçamento
                  </button>
                </li>
                <li>
                  <button 
                    className={activeTab === 'reports' ? 'btn-primary' : ''} 
                    onClick={() => setActiveTab('reports')}
                  >
                    Relatórios
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="main-content">
            {activeTab === 'overview' && (
              <>
                <section className="chart-section">
                  <h2 className="text-xl font-semibold mb-4">Resumo Financeiro</h2>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-secondary">Gráfico de resumo financeiro será exibido aqui</p>
                  </div>
                </section>
                
                <section className="list-section">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Transações Recentes</h2>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                      {showForm ? 'Cancelar' : 'Nova Transação'}
                    </button>
                  </div>
                  
                  {showForm && (
                    <div className="mb-6 p-6" style={{ backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
                      <h3 className="font-semibold mb-4">Adicionar Transação</h3>
                      <form onSubmit={handleSubmit}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          <div>
                            <label htmlFor="date">Data</label>
                            <input
                              id="date"
                              type="date"
                              name="date"
                              value={transactionForm.date}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="description">Descrição</label>
                            <input
                              id="description"
                              type="text"
                              name="description"
                              value={transactionForm.description}
                              onChange={handleInputChange}
                              placeholder="Ex: Supermercado, Salário"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="category">Categoria</label>
                            <select
                              id="category"
                              name="category"
                              value={transactionForm.category}
                              onChange={handleInputChange}
                              required
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="type">Tipo</label>
                            <select
                              id="type"
                              name="type"
                              value={transactionForm.type}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="expense">Despesa</option>
                              <option value="income">Receita</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="amount">Valor</label>
                            <input
                              id="amount"
                              type="text"
                              name="amount"
                              value={transactionForm.amount}
                              onChange={handleAmountChange}
                              placeholder="R$ 0,00"
                              required
                            />
                          </div>
                          
                          <div className="flex items-center justify-end" style={{ alignSelf: 'flex-end' }}>
                            <button 
                              type="submit" 
                              className="btn-accent"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Descrição</th>
                          <th>Categoria</th>
                          <th>Valor</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map(transaction => (
                            <tr key={transaction.id}>
                              <td>{transaction.date}</td>
                              <td>{transaction.description}</td>
                              <td>{transaction.category}</td>
                              <td className={transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                                {transaction.amount.toLocaleString('pt-BR', { 
                                  style: 'currency', 
                                  currency: 'BRL' 
                                })}
                              </td>
                              <td>
                                <button 
                                  className="delete-btn" 
                                  onClick={() => handleDelete(transaction.id)}
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="empty-message">
                              Nenhuma transação encontrada
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
            
            {activeTab === 'transactions' && (
              <section className="list-section">
                <h2 className="text-xl font-semibold mb-4">Todas as Transações</h2>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Buscar transações..."
                      className="mb-4"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>
                  <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancelar' : 'Nova Transação'}
                  </button>
                </div>
                
                {showForm && (
                  <div className="mb-6 p-6" style={{ backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
                    <h3 className="font-semibold mb-4">Adicionar Transação</h3>
                    <form onSubmit={handleSubmit}>
                      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label htmlFor="date">Data</label>
                          <input
                            id="date"
                            type="date"
                            name="date"
                            value={transactionForm.date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description">Descrição</label>
                          <input
                            id="description"
                            type="text"
                            name="description"
                            value={transactionForm.description}
                            onChange={handleInputChange}
                            placeholder="Ex: Supermercado, Salário"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="category">Categoria</label>
                          <select
                            id="category"
                            name="category"
                            value={transactionForm.category}
                            onChange={handleInputChange}
                            required
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="type">Tipo</label>
                          <select
                            id="type"
                            name="type"
                            value={transactionForm.type}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="expense">Despesa</option>
                            <option value="income">Receita</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="amount">Valor</label>
                          <input
                            id="amount"
                            type="text"
                            name="amount"
                            value={transactionForm.amount}
                            onChange={handleAmountChange}
                            placeholder="R$ 0,00"
                            required
                          />
                        </div>
                        
                        <div className="flex items-center justify-end" style={{ alignSelf: 'flex-end' }}>
                          <button 
                            type="submit" 
                            className="btn-accent"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
                
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Valor</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map(transaction => (
                          <tr key={transaction.id}>
                            <td>{transaction.date}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.category}</td>
                            <td className={transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                              {transaction.amount.toLocaleString('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              })}
                            </td>
                            <td>
                              <button 
                                className="delete-btn" 
                                onClick={() => handleDelete(transaction.id)}
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-message">
                            Nenhuma transação encontrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            
            {activeTab === 'budget' && (
              <section className="list-section">
                <h2 className="text-xl font-semibold mb-4">Orçamento Mensal</h2>
                <p className="mb-4">Configure seus limites de gastos por categoria:</p>
                
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {categories.filter(cat => cat !== 'Receita').map(category => (
                    <div key={category} className="p-6" style={{ backgroundColor: 'var(--card-background)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                      <h3 className="font-semibold mb-2">{category}</h3>
                      <div className="mb-4">
                        <label htmlFor={`budget-${category}`}>Limite mensal</label>
                        <input
                          id={`budget-${category}`}
                          type="text"
                          placeholder="R$ 0,00"
                        />
                      </div>
                      <div>
                        <p>Gasto atual: R$ 0,00</p>
                        <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginTop: '8px' }}>
                          <div style={{ height: '100%', width: '0%', backgroundColor: 'var(--primary-color)', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {activeTab === 'reports' && (
              <section className="list-section">
                <h2 className="text-xl font-semibold mb-4">Relatórios e Análises</h2>
                
                <div className="mb-6">
                  <div className="view-toggle mb-4">
                    <button className="active">Por Categoria</button>
                    <button>Por Mês</button>
                    <button>Receita vs Despesa</button>
                  </div>
                  
                  <div className="h-64 flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
                    <p>Gráfico de relatório será exibido aqui</p>
                  </div>
                </div>
                
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="p-6" style={{ backgroundColor: 'var(--card-background)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                    <h3 className="font-semibold mb-2">Total de Receitas</h3>
                    <p className="text-2xl" style={{ color: '#22c55e' }}>R$ 3.000,00</p>
                  </div>
                  
                  <div className="p-6" style={{ backgroundColor: 'var(--card-background)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                    <h3 className="font-semibold mb-2">Total de Despesas</h3>
                    <p className="text-2xl" style={{ color: '#ef4444' }}>R$ 268,00</p>
                  </div>
                  
                  <div className="p-6" style={{ backgroundColor: 'var(--card-background)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                    <h3 className="font-semibold mb-2">Saldo</h3>
                    <p className="text-2xl" style={{ color: '#3b82f6' }}>R$ 2.732,00</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
