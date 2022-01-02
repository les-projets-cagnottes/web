import { AuditModel, GenericModel } from '..';

export class NewsModel extends AuditModel {
    type: string = '';
    title: string = '';
    content: string = '';
    workspace: string = '';
    author: GenericModel = new GenericModel();
    organization: GenericModel = new GenericModel();
    project: GenericModel = new GenericModel();
}
