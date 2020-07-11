import { GenericModel } from './generic.model';
import { AuditModel } from './audit.model';

export class IdeaModel extends AuditModel {
    shortDescription: string = '';
    longDescription: string = '';
    hasAnonymousCreator: boolean = false;
    hasLeaderCreator: boolean = false;
    organization: GenericModel;
}
