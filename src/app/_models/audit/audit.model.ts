import { GenericModel } from '../generic/generic.model';

export class AuditModel extends GenericModel {
    createdAt: Date = new Date();
    createdBy = '';
    updatedAt: Date = new Date();
    updatedBy = '';
}
