export async function apiFetch(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, cache: 'no-store' });
  if (response.status === 401) {
    window.location.assign('/');
    throw new Error('Please log in with Spotify again');
  }
  if (!response.ok) throw new Error(response.status === 429 ? 'Spotify rate limit reached. Please try again later.' : 'Spotify data could not be loaded. Please try again.');
  return response;
}
