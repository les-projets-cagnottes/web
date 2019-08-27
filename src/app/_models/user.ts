import { Authority } from './authority';
import { Organization } from './organization';

export class User {
    id: number;
    createdAt: Date;
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    avatarUrl: string;
    isActivated: boolean;
    token: string;
    userAuthorities: Authority[];
    organizations: Organization[];

    decode(user: User) {
        this.id = user.id
        this.createdAt = user.createdAt;
        this.username = user.username;
        this.email = user.email;
        this.password = user.password;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.avatarUrl = user.avatarUrl;
        this.isActivated = user.isActivated;
        this.token = user.token;
        this.userAuthorities = user.userAuthorities;
        this.organizations = user.organizations;
        return this;
    }

    public getDefaultAvatarUrl(): string {
        //return "https://ui-avatars.com/api/?name=" + this.firstname + "+" + this.lastname + "&background=6CBFBB";
        return "https://i.pravatar.cc/100?u=" + this.email
    }
}