import { User } from './user';
import { Budget } from './budget';
import { Content } from './content';
import { SlackTeam } from './slackTeam';

export class Organization {
    id: number;
    name: string = '';
    slackTeamId: string = '';
    members: User[] = [];
    budgets: Budget[] = [];
    contents: Content[] = [];
    slackTeam: SlackTeam;
}