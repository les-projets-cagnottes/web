
import { AuditModel } from './audit.model';
import { GenericModel } from './generic.model';

export class OrganizationAuthorityModel extends AuditModel {
    name: string;
    organization: GenericModel;
}