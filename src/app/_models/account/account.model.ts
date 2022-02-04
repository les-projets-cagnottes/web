import { AuditModel } from '../audit/audit.model';
import { GenericModel } from '../generic/generic.model';

export class AccountModel extends AuditModel {
    initialAmount: number = 0;
    amount: number = 0;
    owner: GenericModel = new GenericModel();
    budget: GenericModel = new GenericModel();
}
