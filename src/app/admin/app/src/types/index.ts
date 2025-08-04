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

export interface FormErrors {
  [key: string]: string | undefined;
}

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  ServiceRequest: undefined;
  Survey: undefined;
  Admin: undefined;
};
