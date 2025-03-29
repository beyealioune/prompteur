export interface Availability {
    id: number;
    date: string;  // Utiliser un format de date ISO 8601
    time: string;
    isAvailable: boolean;
    userId: number;  // ID de l'utilisateur associé
  }