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
}