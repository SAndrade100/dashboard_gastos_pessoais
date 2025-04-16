import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseFormProps {
  addExpense: (expense: {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
  }) => void;
  showMobileForm?: boolean;
  setShowMobileForm?: (show: boolean) => void;
}

export default function ExpenseForm({ 
  addExpense,
  showMobileForm,
  setShowMobileForm 
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Outros'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expense = {
      id: uuidv4(),
      description: formData.description,
      amount: Number(formData.amount),
      date: formData.date,
      category: formData.category
    };

    addExpense(expense);
    
    // Reset form
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Outros'
    });

    if (setShowMobileForm) {
      setShowMobileForm(false);
    }
  };

  return (
    <div className="expense-form">
      <h2>Adicionar Despesa</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Valor (R$)</label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Data</label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoria</label>
          <select
            id="category"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="Outros">Outros</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Transporte">Transporte</option>
            <option value="Moradia">Moradia</option>
            <option value="Saúde">Saúde</option>
            <option value="Educação">Educação</option>
            <option value="Lazer">Lazer</option>
            <option value="Vestuário">Vestuário</option>
          </select>
        </div>

        <button type="submit">Adicionar Despesa</button>
      </form>
    </div>
  );
}
