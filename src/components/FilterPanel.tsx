import React from 'react';

interface FilterPanelProps {
  viewMode: 'month' | 'year';
  setViewMode: (mode: 'month' | 'year') => void;
  yearFilter: number;
  setYearFilter: (year: number) => void;
  monthFilter: number;
  setMonthFilter: (month: number) => void;
}

export function FilterPanel({
  viewMode,
  setViewMode,
  yearFilter,
  setYearFilter,
  monthFilter,
  setMonthFilter
}: FilterPanelProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="filter-panel">
      <div className="view-mode-selector">
        <button 
          className={viewMode === 'month' ? 'active' : ''} 
          onClick={() => setViewMode('month')}
        >
          Mensal
        </button>
        <button 
          className={viewMode === 'year' ? 'active' : ''} 
          onClick={() => setViewMode('year')}
        >
          Anual
        </button>
      </div>

      <div className="period-selector">
        {viewMode === 'month' && (
          <select 
            value={monthFilter} 
            onChange={(e) => setMonthFilter(Number(e.target.value))}
          >
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
        )}

        <select 
          value={yearFilter} 
          onChange={(e) => setYearFilter(Number(e.target.value))}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
