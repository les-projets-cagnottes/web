import { User } from './user';
import { Project } from './project';

export class Donation {
    id: number;
    amount: number;
    contributor: User;
    project: Project;
}