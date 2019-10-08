import { User } from './user';
import { Organization } from './organization';
import { Donation } from './donation';
import { Content } from './content';

export class Budget {
    id: number;
    name: string;
    amountPerMember: number = 0;
    isDistributed: boolean = false;
    startDate: Date;
    endDate: Date;
    organization: Organization;
    sponsor: User;
    donations: Donation[];
    rules: Content;
    
    // Only in Valyou-Web
    usage: string;
    totalDonations: number = 0;
    totalDonationsPercent: string;
    remaining: string;
    totalUserDonations: number = 0;
}