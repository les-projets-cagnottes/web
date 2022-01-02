import { AuditModel, GenericModel } from '..';

export class ProjectModel extends AuditModel {
    
    title: string = '';
    status: string = 'DRAFT';
    shortDescription: string = '';
    longDescription: string = '';
    peopleRequired: number = 2;
    workspace: string = '';
    leader: GenericModel = new GenericModel();
    organization: GenericModel = new GenericModel();
    peopleGivingTimeRef: number[] = [];
    campaignsRef: number[] = [];
    newsRef: number[] = [];

    // Only in this component
    peopleRequiredPercent: string = '';
}
