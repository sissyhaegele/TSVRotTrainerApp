const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

export const api = {
  async getTrainers() {
    const response = await fetch(`${API_URL}/trainers`);
    return response.json();
  },
  
  async getCourses() {
    const response = await fetch(`${API_URL}/courses`);
    return response.json();
  },
  
  async createTrainer(trainer) {
    const response = await fetch(`${API_URL}/trainers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trainer)
    });
    return response.json();
  },
  
  async createCourse(course) {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    return response.json();
  }
};
