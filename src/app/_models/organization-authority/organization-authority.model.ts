import { AuditModel, GenericModel } from '..';

export class OrganizationAuthorityModel extends AuditModel {
    name = '';
    organization: GenericModel = new GenericModel();
}