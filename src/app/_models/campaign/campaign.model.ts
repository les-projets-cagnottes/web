import { AuditModel } from '../audit.model';
import { GenericModel } from '../generic.model';

export class CampaignModel extends AuditModel {
    
    title: string = '';
    status: string = 'IN_PROGRESS';
    donationsRequired: number = 0.00;
    fundingDeadline: Date;
    totalDonations: number = 0;
    project: GenericModel = new GenericModel();
    budget: GenericModel = new GenericModel();

    // Only in this component
    remainingDays: number;
    fundingDeadlinePercent: string;
    donationsRequiredPercent: string;

}

