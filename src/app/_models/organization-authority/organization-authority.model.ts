import { AuditModel, GenericModel } from '..';

export class OrganizationAuthorityModel extends AuditModel {
    name: string = '';
    organization: GenericModel = new GenericModel();
}