import { Authority } from './authority';
import { Organization } from './organization';

export class User {
    id: number;
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    avatarUrl: string;
    color: string;
    isActivated: boolean;
    token: string;
    userAuthorities: Authority[];
    organizations: Organization[];
}