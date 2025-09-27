class ApiService {
  static getStoredTrainers() {
    const stored = localStorage.getItem('tsvrot-trainers');
    return stored ? JSON.parse(stored) : [
      {id: 1, name: 'Desiree Knopf', email: 'desiree.knopf@tsvrot.de', phone: '+49 6227 123456', qualifications: ['Übungsleiter C', 'Kinderturnen', 'Erste Hilfe'], isActive: true, availableDays: ['Monday', 'Wednesday', 'Friday'], notes: 'Leiterin Kinderturnen'},
      {id: 2, name: 'Sarah Winkler', email: 'sarah.winkler@tsvrot.de', phone: '+49 6227 234567', qualifications: ['Trainer B', 'Geräteturnen', 'Fitness'], isActive: true, availableDays: ['Tuesday', 'Thursday', 'Saturday'], notes: 'Spezialistin Geräteturnen'},
      {id: 3, name: 'Julia Miller', email: 'julia.miller@tsvrot.de', phone: '+49 6227 345678', qualifications: ['Übungsleiter C', 'Fitness', 'Gesundheitssport'], isActive: true, availableDays: ['Monday', 'Wednesday', 'Thursday'], notes: 'Fitness und Gesundheitssport'},
      {id: 4, name: 'Tom Schulze', email: 'tom.schulze@tsvrot.de', phone: '+49 6227 456789', qualifications: ['Übungsleiter C', 'Fitness'], isActive: true, availableDays: ['Tuesday', 'Thursday'], notes: 'Herrenturnen'},
      {id: 5, name: 'Nina Weber', email: 'nina.weber@tsvrot.de', phone: '+49 6227 567890', qualifications: ['Übungsleiter C', 'Gesundheitssport', 'Erste Hilfe'], isActive: true, availableDays: ['Monday', 'Friday'], notes: 'Damengymnastik'},
      {id: 6, name: 'Max Hoffmann', email: 'max.hoffmann@tsvrot.de', phone: '+49 6227 678901', qualifications: ['Übungsleiter C', 'Kinderturnen'], isActive: true, availableDays: ['Tuesday', 'Wednesday'], notes: 'Jugendturnen'}
    ];
  }
  
  static saveTrainers(trainers) {
    localStorage.setItem('tsvrot-trainers', JSON.stringify(trainers));
  }
  
  static async fetchTrainers() {
    return this.getStoredTrainers();
  }
  
  static async addTrainer(trainer) {
    const trainers = this.getStoredTrainers();
    trainer.id = Math.max(...trainers.map(t => t.id), 0) + 1;
    trainers.push(trainer);
    this.saveTrainers(trainers);
    return trainer;
  }
  
  static async updateTrainer(id, updatedTrainer) {
    const trainers = this.getStoredTrainers();
    const index = trainers.findIndex(t => t.id === id);
    if (index !== -1) {
      trainers[index] = {...updatedTrainer, id};
      this.saveTrainers(trainers);
    }
    return updatedTrainer;
  }
  
  static async deleteTrainer(id) {
    const trainers = this.getStoredTrainers();
    const filtered = trainers.filter(t => t.id !== id);
    this.saveTrainers(filtered);
  }
  
  static async fetchCourses() {
    const stored = localStorage.getItem('tsvrot-courses');
    return stored ? JSON.parse(stored) : [
      {id: 1, name: 'Frauengymnastik', day_of_week: 'Monday', start_time: '20:00:00', end_time: '21:30:00', location: 'Turnhalle', required_trainers: 1},
      {id: 2, name: 'Turnzwerge 3-4 Jahre', day_of_week: 'Tuesday', start_time: '15:30:00', end_time: '16:30:00', location: 'Turnhalle', required_trainers: 2},
      {id: 3, name: 'Turnzwerge 5-6 Jahre', day_of_week: 'Tuesday', start_time: '16:45:00', end_time: '17:45:00', location: 'Turnhalle', required_trainers: 2},
      {id: 4, name: 'Geräteturnen Jugend', day_of_week: 'Wednesday', start_time: '18:00:00', end_time: '19:30:00', location: 'Turnhalle', required_trainers: 2},
      {id: 5, name: 'Herrenturnen', day_of_week: 'Thursday', start_time: '20:00:00', end_time: '21:30:00', location: 'Turnhalle', required_trainers: 1},
      {id: 6, name: 'Damengymnastik', day_of_week: 'Friday', start_time: '19:00:00', end_time: '20:00:00', location: 'Vereinsheim', required_trainers: 1}
    ];
  }
}

export default ApiService;
