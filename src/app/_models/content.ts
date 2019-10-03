import { Organization } from './organization';

export class Content {
    id: number;
    name: string = '';
    value: string = '';
    organizations: Organization[];
}