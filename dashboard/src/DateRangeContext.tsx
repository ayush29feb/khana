import { createContext, useContext, useState } from 'react';

interface DateRange {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (d: string) => void;
  setDateTo: (d: string) => void;
}

function currentWeek(): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 1=Mon...
  const diff = (day === 0 ? -6 : 1 - day); // offset to Monday
  const mon = new Date(today);
  mon.setDate(today.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { dateFrom: fmt(mon), dateTo: fmt(sun) };
}

const DateRangeContext = createContext<DateRange>({
  ...currentWeek(),
  setDateFrom: () => {},
  setDateTo: () => {},
});

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const { dateFrom: initFrom, dateTo: initTo } = currentWeek();
  const [dateFrom, setDateFrom] = useState(initFrom);
  const [dateTo, setDateTo] = useState(initTo);
  return (
    <DateRangeContext.Provider value={{ dateFrom, dateTo, setDateFrom, setDateTo }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  return useContext(DateRangeContext);
}
