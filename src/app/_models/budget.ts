import { User } from './user';
import { Organization } from './organization';
import { Donation } from './donation';

export class Budget {
    id: number;
    name: string;
    amountPerMember: number;
    startDate: Date;
    endDate: Date;
    organization: Organization;
    sponsor: User;
    donations: Donation[];
    
    // Only in Valyou-Web
    usage: string;
}