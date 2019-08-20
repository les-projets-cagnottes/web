import { User } from './user';
import { Organization } from './organization';
import { Donation } from './donation';

export class Budget {
    id: number;
    name: string;
    amountPerMember: number = 0;
    distributed: boolean = false;
    startDate: Date;
    endDate: Date;
    organization: Organization;
    sponsor: User;
    donations: Donation[];
    
    // Only in Valyou-Web
    usage: string;
    totalDonations: number = 0;
    totalDonationsPercent: string;
    totalUserDonations: number = 0;
}