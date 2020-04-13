import { User } from './user';
import { Budget } from './budget';
import { Content } from './content';
import { SlackTeam } from './slackTeam';
import { OrganizationAuthority } from './organizationAuthority';

export class Organization {
    id: number;
    name: string = '';
    members: User[] = [];
    budgets: Budget[] = [];
    contents: Content[] = [];
    organizationAuthorities: OrganizationAuthority[] = [];
    slackTeam: SlackTeam;
    
    static decode(obj?: any): Organization {
        var organization = new Organization();
        organization.id = obj.id;
        organization.name = obj.name;
        organization.members = obj.members !== undefined ? obj.members : [];
        organization.budgets = obj.budgets !== undefined ? obj.budgets : [];
        organization.contents = obj.contents !== undefined ? obj.contents : [];
        organization.organizationAuthorities = obj.organizationAuthorities !== undefined ? obj.organizationAuthorities : [];
        organization.slackTeam = obj.slackTeam !== undefined ? obj.slackTeam : undefined;
        return organization;
      }
}