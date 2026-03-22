const API_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost'
    ? 'http://localhost:8181/api'
    : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api'
);

async function request(endpoint, options = {}) {
  const response = await fetch(API_URL + endpoint, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || 'API-Fehler: ' + response.status);
  }
  return response.json();
}

export { API_URL };

export const api = {
  getTrainers: () => request('/trainers'),
  getCourses: () => request('/courses'),
  createTrainer: (trainer) => request('/trainers', { method: 'POST', body: JSON.stringify(trainer) }),
  createCourse: (course) => request('/courses', { method: 'POST', body: JSON.stringify(course) }),
};
