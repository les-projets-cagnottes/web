import { AuditModel, GenericModel } from '..';

export class ContentModel extends AuditModel {
    name: string = '';
    value: string = '';
    workspace: string = '';
    organization: GenericModel = new GenericModel();
}