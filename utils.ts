
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
  }).format(amount);
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const getNextSerialNumber = (items: { id: string }[], start: number) => {
  if (items.length === 0) return start.toString();
  const maxId = Math.max(...items.map(item => parseInt(item.id)));
  return (maxId + 1).toString();
};
