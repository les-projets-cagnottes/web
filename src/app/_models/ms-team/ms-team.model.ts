import { AuditModel, GenericModel } from "..";

export class MsTeamModel extends AuditModel {
    displayName: string = '';
    tenantId: string = '';
    groupId: string = '';
    organization: GenericModel = new GenericModel();
}
