// WhatsApp avatar colors and generator

const AVATAR_COLORS = [
  '#00a884', // WhatsApp Teal
  '#25d366', // WhatsApp Green
  '#128c7e', // WhatsApp Emerald
  '#075e54', // WhatsApp Dark Green
  '#34b7f1', // WhatsApp Sky
  '#53bdeb', // WhatsApp Blue
  '#795548', // Warm Brown
  '#673ab7', // Deep Purple
  '#3f51b5', // Indigo
  '#e91e63', // Rose
  '#f57c00', // Amber Orange
  '#009688', // Teal
];

export function getAvatarColor(idOrName = '') {
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name = '') {
  if (!name) return 'WA';
  const parts = name.trim().split(/[\s_-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
