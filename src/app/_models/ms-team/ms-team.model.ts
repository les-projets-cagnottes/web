import { AuditModel, GenericModel } from "..";

export class MsTeamModel extends AuditModel {
    tenantId: string = '';
    organization: GenericModel = new GenericModel();
}
