import { AuditModel } from './audit.model';
import { GenericModel } from './generic.model';

export class CampaignModel extends AuditModel {

    title: string = '';
    status: string = 'A_IN_PROGRESS';
    shortDescription: string = '';
    longDescription: string = '';
    donationsRequired: number = 0.00;
    peopleRequired: number = 2;
    fundingDeadline: Date;
    totalDonations: number = 0;
    leader: GenericModel = new GenericModel();
    project: GenericModel = new GenericModel();
    peopleGivingTimeRef: number[] = [];
    organizationsRef: number[] = [];
    budgetsRef: number[] = [];

    // Only in Valyou-Web
    remainingDays: number;
    fundingDeadlinePercent: string;
    peopleRequiredPercent: string;
    donationsRequiredPercent: string;
}

