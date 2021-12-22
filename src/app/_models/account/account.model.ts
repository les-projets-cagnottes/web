import { GenericModel } from '../generic.model';
import { AuditModel } from '../audit.model';

export class AccountModel extends AuditModel {
    initialAmount: number;
    amount: number;
    owner: GenericModel;
    budget: GenericModel;
}
