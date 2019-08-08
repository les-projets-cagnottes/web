import { User } from './user';
import { Project } from './project';
import { Budget } from './budget';

export class Donation {
    id: number;
    amount: number;
    contributor: User;
    project: Project;
    budget: Budget;
}