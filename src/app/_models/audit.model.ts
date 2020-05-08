import { GenericModel } from './generic.model';

export class AuditModel extends GenericModel {
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}
