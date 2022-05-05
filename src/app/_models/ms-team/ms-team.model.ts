import { AuditModel, GenericModel } from "..";

export class MsTeamModel extends AuditModel {
    displayName: string = '';
    tenantId: string = '';
    groupId: string = '';
    channelId: string = '';
    companyFilter: string = '';
    organization: GenericModel = new GenericModel();
}
