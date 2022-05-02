import { AuditModel, GenericModel } from '..';
import { ProjectStatus } from './project-status';

export class ProjectModel extends AuditModel {
    
    title: string = '';
    status: ProjectStatus = ProjectStatus.DRAFT;
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

    get statusStr() {
        return this.status.toString();
    }
}
