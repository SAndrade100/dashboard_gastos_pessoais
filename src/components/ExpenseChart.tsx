import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface ExpenseChartProps {
  viewMode: 'month' | 'year';
  yearFilter: number;
  monthFilter: number;
  expenses: Expense[];
  chartRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExpenseChart({
  viewMode,
  yearFilter,
  monthFilter,
  expenses,
  chartRef
}: ExpenseChartProps): React.ReactElement {
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth() + 1;

    if (viewMode === 'month') {
      return expenseYear === yearFilter && expenseMonth === monthFilter;
    }
    return expenseYear === yearFilter;
  });

  const chartData = viewMode === 'month' 
    ? getCategoryData(filteredExpenses)
    : getMonthlyData(filteredExpenses);

  const colors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FDB462', '#FB8072', '#B3DE69', '#FCCDE5'
  ];

  return (
    <div className="expense-chart" ref={chartRef}>
      <h2>
        {viewMode === 'month' ? 'Gastos por Categoria' : 'Gastos Mensais'}
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={viewMode === 'month' ? 'category' : 'month'} 
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{ 
                value: 'Valor (R$)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
            />
            <Bar dataKey="amount">
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function getMonthlyData(expenses: Expense[]) {
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const monthlyData = monthNames.map(month => ({ month, amount: 0 }));

  expenses.forEach(expense => {
    const month = new Date(expense.date).getMonth();
    monthlyData[month].amount += expense.amount;
  });

  return monthlyData;
}
