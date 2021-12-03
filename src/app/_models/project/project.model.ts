import { AuditModel } from "../audit.model";
import { GenericModel } from "../generic.model";

export class ProjectModel extends AuditModel {
    
    title: string = '';
    status: string = 'DRAFT';
    shortDescription: string = '';
    longDescription: string = '';
    peopleRequired: number = 2;
    workspace: string = '';
    leader: GenericModel = new GenericModel();
    peopleGivingTimeRef: number[] = [];
    organizationsRef: number[] = [];
    campaignsRef: number[] = [];

    // Only in this component
    peopleRequiredPercent: string;
}
