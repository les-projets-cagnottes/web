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
    rules: Content;
    donations: Donation[] = [];
    
    // Only in Valyou-Web
    usage: string;
    totalDonations: number = 0;
    totalDonationsPercent: string;
    remaining: string;
    totalUserDonations: number = 0;

    static decode(obj?: any): Budget {
        var budget = new Budget();
        budget.id = obj.id;
        budget.name = obj.name;
        budget.amountPerMember = obj.amountPerMember;
        budget.isDistributed = obj.isDistributed;
        budget.startDate = obj.startDate;
        budget.endDate = obj.endDate;
        budget.organization = obj.organization !== undefined ? obj.organization : undefined;
        budget.sponsor = obj.sponsor !== undefined ? obj.sponsor : undefined;
        budget.rules = obj.rules !== undefined ? obj.rules : undefined;
        budget.donations = obj.donations !== undefined ? obj.donations : [];
        return budget;
    }
}