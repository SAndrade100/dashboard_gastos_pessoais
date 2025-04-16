import { forwardRef } from 'react';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';
import { getFullMonthName } from '../../utils/dateHelpers';

const ExpenseChart = forwardRef(({ 
  viewMode, 
  chartData, 
  monthFilter, 
  yearFilter,
  totalExpenses 
}, ref) => {
  return (
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
        <div className="h-64 mb-6" ref={ref}>
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
  );
});

ExpenseChart.displayName = 'ExpenseChart';
export default ExpenseChart;
