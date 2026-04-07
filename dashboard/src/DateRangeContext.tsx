import { createContext, useContext, useState } from 'react';

interface DateRange {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (d: string) => void;
  setDateTo: (d: string) => void;
}

function lastSevenDays(): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const week = new Date(today);
  week.setDate(today.getDate() - 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { dateFrom: fmt(week), dateTo: fmt(today) };
}

const DateRangeContext = createContext<DateRange>({
  ...lastSevenDays(),
  setDateFrom: () => {},
  setDateTo: () => {},
});

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const { dateFrom: initFrom, dateTo: initTo } = lastSevenDays();
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
