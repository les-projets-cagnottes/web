import { AuditModel, GenericModel } from '..';
import { ProjectStatus } from './project-status';

export class ProjectModel extends AuditModel {
    
    title = '';
    status: ProjectStatus = ProjectStatus.DRAFT;
    isPublished = false;
    ideaHasAnonymousCreator = false;
    ideaHasLeaderCreator = false;
    shortDescription = '';
    longDescription = '';
    peopleRequired = 2;
    workspace = '';
    leader: GenericModel = new GenericModel();
    organization: GenericModel = new GenericModel();
    peopleGivingTimeRef: number[] = [];
    campaignsRef: number[] = [];
    newsRef: number[] = [];

}
