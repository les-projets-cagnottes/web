import { User } from './user';
import { Donation } from './donation';

export class Project {
    id: number;
    createdAt: Date;
    title: string;
    shortDescription: string;
    longDescription: string;
    donationsRequired: number;
    peopleRequired: number;
    leader: User;
    fundingDeadline: Date;
    donations: Donation[];
    peopleGivingTime: User[];

    // Only in Valyou-Web
    remainingDays: number;
    fundingDeadlinePercent: string;
    peopleRequiredPercent: string;
    donationsRequiredPercent: string;
    totalDonations: number = 0;
}

