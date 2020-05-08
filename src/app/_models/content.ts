import { Organization } from '../_entities';

export class Content {
    id: number;
    name: string = '';
    value: string = '';
    organizations: Organization[];
}