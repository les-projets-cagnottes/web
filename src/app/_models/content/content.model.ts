import { AuditModel, GenericModel } from '..';

export class ContentModel extends AuditModel {
    name = '';
    value = '';
    workspace = '';
    organization: GenericModel = new GenericModel();
}