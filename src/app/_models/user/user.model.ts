import { AuditModel } from '..';

export class UserModel extends AuditModel {
    username = '';
    email = '';
    password = '';
    firstname = '';
    lastname = '';
    avatarUrl = '';
    enabled = true;
    token = '';
    userAuthoritiesRef: number[] = [];
    userOrganizationAuthoritiesRef: number[] = [];

    // Only in web component
    budgetUsage = '';
    isUserSponsor = false;
    isUserManager = false;
    isUserOwner = false;
    hasLeftTheOrganization = false;

}