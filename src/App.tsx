import React, { useState, useRef } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseChart from './components/ExpenseChart';
import { useExpenses } from './hooks/useExpenses';
import { FilterPanel } from './components/FilterPanel';

export default function FinancialDashboard() {
  const { expenses, addExpense, removeExpense } = useExpenses();
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const chartRef = useRef<HTMLDivElement | null>(null);
  
  return (
    <div className="dashboard">
      <div className="container">
        <header>
          <h1>Dashboard de Gastos Financeiros</h1>
          <p>Acompanhe e gerencie seus gastos mensais e anuais</p>
        </header>
        
        {/* Botão de adicionar visível apenas em dispositivos móveis */}
        <div className="mobile-actions">
          <button 
            className="mobile-add-button" 
            onClick={() => setShowMobileForm(!showMobileForm)}
          >
            {showMobileForm ? 'Fechar formulário' : '+ Adicionar despesa'}
          </button>
        </div>
        
        {/* Layout principal - Grid com sidebar e área principal */}
        <div className="grid">
          {/* Sidebar - Formulário e filtros */}
          <aside className={`sidebar ${showMobileForm ? 'mobile-show' : ''}`}>
            <ExpenseForm 
              addExpense={addExpense}
              showMobileForm={showMobileForm}
              setShowMobileForm={setShowMobileForm}
            />
            
            <FilterPanel 
              viewMode={viewMode}
              setViewMode={setViewMode}
              yearFilter={yearFilter}
              setYearFilter={setYearFilter}
              monthFilter={monthFilter}
              setMonthFilter={setMonthFilter}
            />
          </aside>
          
          {/* Área principal - Gráficos e tabela */}
          <main className="main-content">
            <section className="chart-section">
              <ExpenseChart 
                viewMode={viewMode}
                yearFilter={yearFilter}
                monthFilter={monthFilter}
                expenses={expenses} 
                chartRef={chartRef}
              />
            </section>
            
            <section className="list-section">
              <ExpenseList 
                expenses={expenses} 
                removeExpense={removeExpense}
                viewMode={viewMode}
                yearFilter={yearFilter}
                monthFilter={monthFilter}
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}