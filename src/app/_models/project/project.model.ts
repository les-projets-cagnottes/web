import { AuditModel, GenericModel } from '..';

export class ProjectModel extends AuditModel {
    
    title = '';
    status = 'DRAFT';
    shortDescription = '';
    longDescription = '';
    peopleRequired = 2;
    workspace = '';
    leader: GenericModel = new GenericModel();
    organization: GenericModel = new GenericModel();
    peopleGivingTimeRef: number[] = [];
    campaignsRef: number[] = [];
    newsRef: number[] = [];

    // Only in this component
    peopleRequiredPercent = '';
}
