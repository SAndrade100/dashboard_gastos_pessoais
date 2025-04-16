import { useState, useEffect, useCallback } from 'react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('financialExpenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  useEffect(() => {
    localStorage.setItem('financialExpenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = useCallback((newExpense: Expense) => {
    setExpenses(currentExpenses => [...currentExpenses, newExpense]);
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpenses(currentExpenses => 
      currentExpenses.filter(expense => expense.id !== id)
    );
  }, []);

  return {
    expenses,
    addExpense,
    removeExpense
  };
}
