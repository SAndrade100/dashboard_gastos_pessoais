import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

export default function ExpenseForm({ onSubmit }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [category, setCategory] = useState('Alimentação');

  const handleSubmit = (e) => {
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
    
    onSubmit(newExpense);
    
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().substr(0, 10));
    setCategory('Alimentação');
  };

  return (
    <div className="card mb-6 p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <PlusCircle className="mr-2" size={20} /> Adicionar Despesa
      </h2>
      <form onSubmit={handleSubmit}>
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
        
        <button type="submit" className="btn-primary">
          Adicionar
        </button>
      </form>
    </div>
  );
}
