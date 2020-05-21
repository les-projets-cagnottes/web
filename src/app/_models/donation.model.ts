import { GenericModel } from './generic.model';
import { AuditModel } from './audit.model';

export class DonationModel extends AuditModel {
    amount: number;
    account: GenericModel;
    contributor: GenericModel;
    campaign: GenericModel;
    budget: GenericModel;
}