import { AuditModel, GenericModel } from '..';

export class CampaignModel extends AuditModel {
    
    title: string = '';
    status: string = 'IN_PROGRESS';
    donationsRequired: number = 0.00;
    fundingDeadline: Date = new Date();
    totalDonations: number = 0;
    project: GenericModel = new GenericModel();
    budget: GenericModel = new GenericModel();

    // Only in this component
    remainingDays: number = 0;
    fundingDeadlinePercent: string = '';
    donationsRequiredPercent: string = '';

}

