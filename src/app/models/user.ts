import { Availability } from "./Availability";

export interface User {
	id: number;
	username: string;
	email: string;
	password?: string; // Facultatif, car il n'est pas toujours nécessaire de l'envoyer côté front
	bio?: string; // Facultatif
	subscriptions?: Set<number>; // IDs des abonnements
	availabilities?: Availability[]; // Disponibilités associées
  }