import { AuditModel, GenericModel } from "..";

export class MsTeamModel extends AuditModel {
    displayName = '';
    tenantId = '';
    groupId = '';
    organization: GenericModel = new GenericModel();
}
