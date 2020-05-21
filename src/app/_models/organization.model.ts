import { GenericModel } from './generic.model';
import { AuditModel } from './audit.model';

export class OrganizationModel extends AuditModel {
    name: string = '';
    logoUrl: string = '';
    slackTeam: GenericModel;
    contentsRef: number[] = [];
    membersRef: number[] = [];
}