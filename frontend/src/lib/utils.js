export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // For backward compatibility with local uploads
  const backendUrl = import.meta.env.VITE_API_URL || '';
  // Remove potential double slashes if backendUrl ends with / and path starts with /
  const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBackendUrl}${cleanPath}`;
};
