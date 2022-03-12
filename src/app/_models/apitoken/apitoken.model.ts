import { AuditModel } from '../audit/audit.model';
import { GenericModel } from '../generic/generic.model';

export class ApiTokenModel extends AuditModel {
    expiration: Date = new Date();
    token = '';
    user: GenericModel = new GenericModel();
}
