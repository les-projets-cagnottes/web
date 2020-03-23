import { User } from './user';
import { Project } from './project';
import { Organization } from './organization';

export class OrganizationAuthority {
    id: number;
    name: string;
    organization: Organization;
}