export interface TResult {
  _id: number;
  text: string;
  createdAt: string | Date; // Allow both string and Date
  system: boolean;
  originalText?: string;
  user: User;
}

export interface User {
  _id: number;
  name: string;
}
