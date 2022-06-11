import { AuditModel, GenericModel } from '..';

export class IdeaModel extends AuditModel {
    icon = '';
    shortDescription = '';
    longDescription = '';
    hasAnonymousCreator = false;
    hasLeaderCreator = false;
    workspace = '';
    submitter: GenericModel = new GenericModel();
    organization: GenericModel = new GenericModel();
}
