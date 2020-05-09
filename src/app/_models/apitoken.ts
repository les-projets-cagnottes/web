import { User } from '../_entities/user';

export class ApiToken {
    id: number;
    expiration: Date;
    token: string;
    user: User;
}