import * as SQLite from 'expo-sqlite';

export interface Guest {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address: string;
  gender: string;
  education: string;
  profession: string;
  institutionAddress?: string;
  purpose: string;
  meetingObjective: string;
  visitDate: string;
  visitTime: string;
  fileName?: string;
  checkIn: string;
  checkOut?: string;
  createdAt: string;
}

export interface ServiceRequest {
  id?: number;
  name: string;
  email: string;
  serviceType: string;
  priority: string;
  description: string;
  fileName?: string;
  status: string;
  createdAt: string;
}

export interface Survey {
  id?: number;
  name: string;
  gender: string;
  education: string;
  profession: string;
  age: number;
  accessEase: string;
  serviceSpeed: string;
  staffCapability: string;
  resultQuality: string;
  facilities: string;
  suggestions?: string;
  createdAt: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('guestbook.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  private async createTables() {
    if (!this.db) return;

    // Guests table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT NOT NULL,
        gender TEXT NOT NULL,
        education TEXT NOT NULL,
        profession TEXT NOT NULL,
        institutionAddress TEXT,
        purpose TEXT NOT NULL,
        meetingObjective TEXT NOT NULL,
        visitDate TEXT NOT NULL,
        visitTime TEXT NOT NULL,
        fileName TEXT,
        checkIn TEXT NOT NULL,
        checkOut TEXT,
        createdAt TEXT NOT NULL
      );
    `);

    // Service requests table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        serviceType TEXT NOT NULL,
        priority TEXT NOT NULL,
        description TEXT NOT NULL,
        fileName TEXT,
        status TEXT DEFAULT 'pending',
        createdAt TEXT NOT NULL
      );
    `);

    // Surveys table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        education TEXT NOT NULL,
        profession TEXT NOT NULL,
        age INTEGER NOT NULL,
        accessEase TEXT NOT NULL,
        serviceSpeed TEXT NOT NULL,
        staffCapability TEXT NOT NULL,
        resultQuality TEXT NOT NULL,
        facilities TEXT NOT NULL,
        suggestions TEXT,
        createdAt TEXT NOT NULL
      );
    `);
  }

  // Guest operations
  async addGuest(guest: Omit<Guest, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(`
      INSERT INTO guests (name, email, phone, address, gender, education, profession, institutionAddress, purpose, meetingObjective, visitDate, visitTime, fileName, checkIn, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      guest.name, guest.email, guest.phone || null, guest.address, guest.gender,
      guest.education, guest.profession, guest.institutionAddress || null,
      guest.purpose, guest.meetingObjective, guest.visitDate, guest.visitTime,
      guest.fileName || null, guest.checkIn, guest.createdAt
    ]);
    
    return result.lastInsertRowId;
  }

  async getAllGuests(): Promise<Guest[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync('SELECT * FROM guests ORDER BY createdAt DESC');
    return result as Guest[];
  }

  async checkOutGuest(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const checkOutTime = new Date().toISOString();
    await this.db.runAsync('UPDATE guests SET checkOut = ? WHERE id = ?', [checkOutTime, id]);
  }

  async getGuestStats(): Promise<{ total: number; checkedIn: number; checkedOut: number }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const totalResult = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM guests');
    const checkedInResult = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM guests WHERE checkOut IS NULL');
    const checkedOutResult = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM guests WHERE checkOut IS NOT NULL');
    
    return {
      total: (totalResult as any)?.count || 0,
      checkedIn: (checkedInResult as any)?.count || 0,
      checkedOut: (checkedOutResult as any)?.count || 0
    };
  }

  // Service request operations
  async addServiceRequest(request: Omit<ServiceRequest, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(`
      INSERT INTO service_requests (name, email, serviceType, priority, description, fileName, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      request.name, request.email, request.serviceType, request.priority,
      request.description, request.fileName || null, request.status, request.createdAt
    ]);
    
    return result.lastInsertRowId;
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync('SELECT * FROM service_requests ORDER BY createdAt DESC');
    return result as ServiceRequest[];
  }

  // Survey operations
  async addSurvey(survey: Omit<Survey, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.runAsync(`
      INSERT INTO surveys (name, gender, education, profession, age, accessEase, serviceSpeed, staffCapability, resultQuality, facilities, suggestions, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      survey.name, survey.gender, survey.education, survey.profession, survey.age,
      survey.accessEase, survey.serviceSpeed, survey.staffCapability, survey.resultQuality,
      survey.facilities, survey.suggestions || null, survey.createdAt
    ]);
    
    return result.lastInsertRowId;
  }

  async getAllSurveys(): Promise<Survey[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getAllAsync('SELECT * FROM surveys ORDER BY createdAt DESC');
    return result as Survey[];
  }
}

export const databaseService = new DatabaseService();
