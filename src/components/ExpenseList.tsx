import React from 'react';
import { generatePDF } from '../utils/pdfGenerators';
import { Trash2, FileDown } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface ExpenseListProps {
  viewMode: 'month' | 'year';
  yearFilter: number;
  monthFilter: number;
  expenses: Expense[];
  removeExpense: (id: string) => void;
}

export default function ExpenseList({
  viewMode,
  yearFilter,
  monthFilter,
  expenses,
  removeExpense
}: ExpenseListProps): React.ReactElement {
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth() + 1;

    if (viewMode === 'month') {
      return expenseYear === yearFilter && expenseMonth === monthFilter;
    }
    return expenseYear === yearFilter;
  });

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const generateExpenseReport = () => {
    const chartData = viewMode === 'month'
      ? getCategoryData(filteredExpenses)
      : getMonthlyData(filteredExpenses);
    
    generatePDF(viewMode, monthFilter, yearFilter, filteredExpenses, totalExpenses, chartData);
  };

  return (
    <div className="expense-list">
      <div className="list-header">
        <h2>Lista de Despesas</h2>
        <button 
          onClick={generateExpenseReport}
          className="download-button"
          title="Baixar relatório"
        >
          <FileDown size={20} />
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => (
              <tr key={expense.id}>
                <td>{expense.description}</td>
                <td>{expense.category}</td>
                <td>{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                <td>R$ {expense.amount.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => removeExpense(expense.id)}
                    className="delete-button"
                    title="Remover despesa"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><strong>Total</strong></td>
              <td colSpan={2}><strong>R$ {totalExpenses.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function getCategoryData(expenses: Expense[]) {
  const categoryMap = new Map<string, number>();
  
  expenses.forEach(expense => {
    const current = categoryMap.get(expense.category) || 0;
    categoryMap.set(expense.category, current + expense.amount);
  });

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount
  }));
}

function getMonthlyData(expenses: Expense[]) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthlyData = new Array(12).fill(0).map((_, index) => ({
    month: monthNames[index],
    amount: 0
  }));

  expenses.forEach(expense => {
    const month = new Date(expense.date).getMonth();
    monthlyData[month].amount += expense.amount;
  });

  return monthlyData;
}
