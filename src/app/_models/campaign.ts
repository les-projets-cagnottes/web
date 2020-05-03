import { User } from './user';
import { Generic } from './generic';

export class Campaign {
    id: number;
    createdAt: Date;
    title: string = '';
    status: string = 'A_IN_PROGRESS';
    shortDescription: string = '';
    longDescription: string = '';
    donationsRequired: number = 0.00;
    peopleRequired: number = 2;
    leader: Generic = new Generic();
    fundingDeadline: Date;
    totalDonations: number = 0;
    peopleGivingTimeRef: number[] = [];
    organizationsRef: number[] = [];
    budgetsRef: number[] = [];

    // TODO : Remove
    donations: any[] = [];
    peopleGivingTime: any[] = [];
    organizations: any[] = [];
    budgets: any[] = [];

    // Only in Valyou-Web
    remainingDays: number;
    fundingDeadlinePercent: string;
    peopleRequiredPercent: string;
    donationsRequiredPercent: string;
}

