import { AuditModel } from '../audit/audit.model';
import { GenericModel } from '../generic/generic.model';

export class AccountModel extends AuditModel {
    initialAmount = 0;
    amount = 0;
    owner: GenericModel = new GenericModel();
    budget: GenericModel = new GenericModel();
}
