import { User } from './user';

export class Project {
    id: number;
    createdAt: Date;
    title: string = '';
    status: string = 'A_IN_PROGRESS';
    shortDescription: string = '';
    longDescription: string = '';
    donationsRequired: number = 0.00;
    peopleRequired: number = 2;
    leader: User = new User();
    fundingDeadline: Date;
    donations: any[] = [];
    totalDonations: number = 0;
    peopleGivingTime: any[] = [];
    organizations: any[] = [];
    budgets: any[] = [];

    // Only in Valyou-Web
    remainingDays: number;
    fundingDeadlinePercent: string;
    peopleRequiredPercent: string;
    donationsRequiredPercent: string;
}

