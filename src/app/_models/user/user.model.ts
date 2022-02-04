import { AuditModel } from '..';

export class UserModel extends AuditModel {
    username: string = '';
    email: string = '';
    password: string = '';
    firstname: string = '';
    lastname: string = '';
    avatarUrl: string = '';
    enabled: boolean = true;
    token: string = '';
    userOrganizationAuthoritiesRef: number[] = [];

    // Only in web component
    budgetUsage: string = '';
    isUserSponsor: boolean = false;
    isUserManager: boolean = false;
    isUserOwner: boolean = false;
    hasLeftTheOrganization: boolean = false;

}