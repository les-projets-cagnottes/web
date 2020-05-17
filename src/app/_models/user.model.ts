import { AuditModel } from './audit.model';

export class UserModel extends AuditModel {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    avatarUrl: string;
    enabled: boolean;
    token: string;
    userOrganizationAuthoritiesRef: number[] = [];

    // Only in Valyou-Web
    budgetUsage: string;
    isUserSponsor: boolean = false;
    isUserManager: boolean = false;
    isUserOwner: boolean = false;

}