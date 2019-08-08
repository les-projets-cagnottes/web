import { User } from './user';
import { Organization } from './organization';
import { Donation } from './donation';

export class Budget {
    id: number;
    amountPerMember: number;
    organization: Organization;
    sponsor: User;
    donations: Donation[];
    
    // Only in Valyou-Web
    usage: number;
}