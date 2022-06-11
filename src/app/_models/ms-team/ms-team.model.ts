import { AuditModel, GenericModel } from "..";

export class MsTeamModel extends AuditModel {
    displayName = '';
    tenantId = '';
    groupId = '';
    channelId = '';
    companyFilter = '';
    organization: GenericModel = new GenericModel();
}
