
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
  }).format(amount);
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTimeOnly = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateTimeFull = (timestamp: number) => {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString('ar-SA', { weekday: 'long' });
  const d = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  const t = date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day} - ${d} | ${t}`;
};

export const getNextSerialNumber = (items: { id: string }[], start: number) => {
  if (!items || items.length === 0) return start.toString();
  const maxId = Math.max(...items.map(item => parseInt(item.id) || 0));
  return (Math.max(maxId, start - 1) + 1).toString();
};
