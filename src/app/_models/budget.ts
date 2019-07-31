import { User } from './user';
import { Organization } from './organization';

export class Budget {
    id: number;
    amountPerMember: number;
    organization: Organization;
    sponsor: User;
}