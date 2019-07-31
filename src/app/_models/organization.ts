import { User } from './user';
import { Budget } from './budget';

export class Organization {
    id: number;
    name: string;
    members: User[];
    budget: Budget[];
}