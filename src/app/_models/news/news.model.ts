import { AuditModel, GenericModel } from '..';

export class NewsModel extends AuditModel {
    type = '';
    title = '';
    content = '';
    workspace = '';
    author: GenericModel = new GenericModel();
    organization: GenericModel = new GenericModel();
    project: GenericModel = new GenericModel();
}
