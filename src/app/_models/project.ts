import { User } from './user';
import { Donation } from './donation';
import { Organization } from './organization';

export class Project {
    id: number;
    createdAt: Date;
    title: string = '';
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

    // Only in Valyou-Web
    remainingDays: number;
    fundingDeadlinePercent: string;
    peopleRequiredPercent: string;
    donationsRequiredPercent: string;
}

