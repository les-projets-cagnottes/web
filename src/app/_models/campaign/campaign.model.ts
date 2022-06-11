import { AuditModel, GenericModel } from '..';

export class CampaignModel extends AuditModel {
    
    title = '';
    status = 'IN_PROGRESS';
    donationsRequired = 0.00;
    fundingDeadline: Date = new Date();
    totalDonations = 0;
    project: GenericModel = new GenericModel();
    budget: GenericModel = new GenericModel();

    // Only in this component
    remainingDays = 0;
    fundingDeadlinePercent = '';
    donationsRequiredPercent = '';

}

