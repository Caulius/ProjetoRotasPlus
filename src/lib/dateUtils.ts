import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getCurrentDate = (): Date => {
  return new Date();
};

export const formatDate = (date: Date, formatString: string = 'dd/MM/yyyy'): string => {
  return format(date, formatString, { locale: ptBR });
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date);
};

export const getEndOfDay = (date: Date): Date => {
  return endOfDay(date);
};

export const createDateWithTimezone = (dateString: string): Date => {
  // Ensure date is created with local timezone to avoid the -1 day issue
  const date = new Date(dateString + 'T00:00:00');
  return date;
};

export const formatForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};