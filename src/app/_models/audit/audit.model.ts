import { GenericModel } from '../generic/generic.model';

export class AuditModel extends GenericModel {
    createdAt: Date = new Date();
    createdBy: string = '';
    updatedAt: Date = new Date();
    updatedBy: string = '';
}
