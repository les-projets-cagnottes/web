import { AuditModel } from "../audit.model";
import { GenericModel } from "../generic.model";

export class NewsModel extends AuditModel {
    type: string = '';
    title: string = '';
    content: string = '';
    author: GenericModel = new GenericModel();
    organization: GenericModel = new GenericModel();
    project: GenericModel = new GenericModel();
}
