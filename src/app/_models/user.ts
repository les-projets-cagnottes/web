import { Authority } from './authority';
import { Organization } from './organization';
import { ApiToken } from './apitoken';
import { SlackUser } from './slackUser';
import { OrganizationAuthority } from './organizationAuthority';

export class User {
    id: number;
    createdAt: Date;
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    avatarUrl: string;
    enabled: boolean;
    token: string;
    userAuthorities: Authority[] = [];
    userOrganizationAuthorities: OrganizationAuthority[] = [];
    organizations: Organization[] = [];
    apitokens: ApiToken[] = [];
    totalBudgetDonations: number;
    slackUser: SlackUser;

    // Only in Valyou-Web
    budgetUsage: string;
    isUserSponsor: boolean = false;
    isUserManager: boolean = false;
    isUserOwner: boolean = false;

    decode(user: User) {
        this.id = user.id
        this.createdAt = user.createdAt;
        this.username = user.username;
        this.email = user.email;
        this.password = user.password;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.avatarUrl = user.avatarUrl;
        this.enabled = user.enabled;
        this.token = user.token;
        this.userAuthorities = user.userAuthorities;
        this.userOrganizationAuthorities = user.userOrganizationAuthorities;
        this.organizations = user.organizations;
        return this;
    }

    public getDefaultAvatarUrl(): string {
        //return "https://ui-avatars.com/api/?name=" + this.firstname + "+" + this.lastname + "&background=6CBFBB";
        return "https://i.pravatar.cc/100?u=" + this.email
    }
}