interface TaxYearFilterProps {
  years: number[];
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
}

export function TaxYearFilter({ years, selectedYear, onSelectYear }: TaxYearFilterProps) {
  if (years.length === 0) return null;

  return (
    <div className="flex gap-1 flex-wrap">
      <button
        onClick={() => onSelectYear(null)}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          selectedYear === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        All Years
      </button>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onSelectYear(year)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            selectedYear === year
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
