import { User } from './user';
import { Donation } from './donation';

export class Project {
    id: number;
    title: string;
    shortDescription: string;
    longDescription: string;
    leader: User;
    fundingDeadline: Date;
    donations: Donation[];
    peopleGivingTime: User[];
}