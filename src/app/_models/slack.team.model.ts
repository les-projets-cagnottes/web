import { AuditModel } from './audit.model';

export class SlackTeamModel extends AuditModel {
    teamId: string;
    teamName: string;
    publicationChannelId: string;
}
