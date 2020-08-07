export const shortID = (p: string): string => {
  return p.slice(-8);
};

export const lastNameFromPath = (path: string): string => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};
