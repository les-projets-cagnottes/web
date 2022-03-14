import {AuditModel} from '..';

export class SlackTeamModel extends AuditModel {
  teamId: string = '';
  teamName: string = '';
  publicationChannel: string = '';
  publicationChannelId = '';
}
