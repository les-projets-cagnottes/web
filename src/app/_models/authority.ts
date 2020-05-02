import { User } from './user';
import { Campaign } from './campaign';

export class Authority {
    id: number;
    name: string;
    users: User[];
}