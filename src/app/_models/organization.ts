import { User } from './user';
import { Budget } from './budget';
import { Content } from './content';

export class Organization {
    id: number;
    name: string = '';
    slackTeamId: string = '';
    members: User[];
    budgets: Budget[];
    contents: Content[];
}