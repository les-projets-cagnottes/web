import { GenericModel } from './generic.model';
import { AuditModel } from './audit.model';

export class BudgetModel extends AuditModel {
    name: string;
    amountPerMember: number = 0;
    isDistributed: boolean = false;
    startDate: Date;
    endDate: Date;
    totalDonations: number = 0;
    organization: GenericModel;
    sponsor: GenericModel;
    rules: GenericModel;
    
    // Only in Valyou-Web
    usage: string;
    totalDonationsPercent: string;
    remaining: string;
}