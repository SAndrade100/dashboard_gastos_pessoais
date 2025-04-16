export const getFullMonthName = (month: number): string => {
  const date = new Date(2000, month - 1, 1);
  return date.toLocaleString('pt-BR', { month: 'long' });
};

export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1;
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};
