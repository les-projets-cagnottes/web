import { User } from './user';
import { Project } from './project';

export class Authority {
    id: number;
    name: string;
    users: User[];
}