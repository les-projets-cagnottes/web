import { User } from './user';
import { Donation } from './donation';
import { Organization } from './organization';
import { Budget } from './budget';


export class Project {
    id: number;
    createdAt: Date;
    title: string = '';
    status: string = 'IN_PROGRESS';
    shortDescription: string = '';
    longDescription: string = '';
    donationsRequired: number = 0.00;
    peopleRequired: number = 2;
    leader: User = new User();
    fundingDeadline: Date;
    donations: Donation[] = [];
    totalDonations: number = 0;
    peopleGivingTime: User[] = [];
    organizations: Organization[] = [];
    budgets: Budget[] = [];

    // Only in Valyou-Web
    remainingDays: number;
    fundingDeadlinePercent: string;
    peopleRequiredPercent: string;
    donationsRequiredPercent: string;
}

