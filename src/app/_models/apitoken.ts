import { User } from './user';

export class ApiToken {
    id: number;
    expiration: Date;
    token: string;
    user: User;
}