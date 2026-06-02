import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface Props {
  value: string;       // YYYY-MM-DD or ''
  onChange: (val: string) => void;
  min?: string;        // YYYY-MM-DD
}

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];

export default function DatePicker({ value, onChange, min }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Which month/year the calendar is showing
  const seed = value ? new Date(value + 'T12:00:00') : (min ? new Date(min + 'T12:00:00') : new Date());
  const [viewYear,  setViewYear]  = useState(seed.getFullYear());
  const [viewMonth, setViewMonth] = useState(seed.getMonth());

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day: number) => {
    const s = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    onChange(s);
    setOpen(false);
  };

  const isDisabled = (day: number) => {
    if (!min) return false;
    const d = new Date(viewYear, viewMonth, day);
    const m = new Date(min + 'T00:00:00');
    return d < m;
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, mo, d] = value.split('-').map(Number);
    return y === viewYear && mo - 1 === viewMonth && d === day;
  };

  const isToday = (day: number) => {
    const now = new Date();
    return now.getFullYear() === viewYear && now.getMonth() === viewMonth && now.getDate() === day;
  };

  // Build grid: leading blanks + days + trailing blanks
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const displayValue = value
    ? new Date(value + 'T12:00:00').toLocaleDateString('en-NG', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all bg-white ${
          open
            ? 'border-amber-500 ring-2 ring-amber-200'
            : value
            ? 'border-amber-400'
            : 'border-amber-200 hover:border-amber-400'
        }`}
      >
        <CalendarDays className="h-5 w-5 text-amber-500 shrink-0" />
        <span className={`flex-1 text-sm ${displayValue ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
          {displayValue || 'Pick a date'}
        </span>
        <ChevronRight className={`h-4 w-4 text-amber-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {/* Calendar popover */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-amber-500">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-white hover:bg-amber-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-bold text-white text-sm tracking-wide">
              {MONTHS[viewMonth]} {viewYear}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-white hover:bg-amber-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-400 py-1.5 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                if (day === null) return <div key={i} />;
                const disabled = isDisabled(day);
                const selected = isSelected(day);
                const today    = isToday(day);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDay(day)}
                    className={`
                      relative aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all
                      ${selected
                        ? 'bg-amber-500 text-white font-bold shadow-sm scale-105'
                        : disabled
                        ? 'text-gray-200 cursor-not-allowed'
                        : today
                        ? 'text-amber-600 font-bold ring-1 ring-amber-400 hover:bg-amber-50'
                        : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'}
                    `}
                  >
                    {day}
                    {today && !selected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected date footer */}
          {value && (
            <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-center">
              <p className="text-xs font-semibold text-amber-700">📅 {displayValue}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
