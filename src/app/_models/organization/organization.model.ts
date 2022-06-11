import { AuditModel, GenericModel } from "..";

export class OrganizationModel extends AuditModel {
    name = '';
    socialName = '';
    logoUrl = '';
    slackTeam: GenericModel = new GenericModel();
    msTeam: GenericModel = new GenericModel();
    contentsRef: number[] = [];
    membersRef: number[] = [];
}
