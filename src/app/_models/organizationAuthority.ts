import { User } from './user';
import { Campaign } from './campaign';
import { Organization } from './organization';

export class OrganizationAuthority {
    id: number;
    name: string;
    organization: Organization;
}