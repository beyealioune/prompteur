import { Availability } from "./Availability";
// 🧾 user.ts – nouvelle version propre du modèle User côté frontend

export interface User {
	id: number;
	username: string;
	email: string;
	password?: string;
	bio?: string;
	photoFilename?: string;
  
	isPremium: boolean; // 
	trialEnd: string;   // 
  }