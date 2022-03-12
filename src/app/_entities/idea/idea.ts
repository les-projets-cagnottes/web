import { IdeaModel } from '../../_models';

import { Organization } from '../organization/organization';
import { User } from '../user/user';

export class Idea extends IdeaModel {

    override submitter: User = new User();
    override organization: Organization = new Organization();
    followers: User[] = [];
    tags: any[] = [];

    static fromModel(model: IdeaModel): Idea {
        const entity = new Idea();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.icon = model.icon;
        entity.shortDescription = model.shortDescription;
        entity.longDescription = model.longDescription;
        entity.hasAnonymousCreator = model.hasAnonymousCreator;
        entity.hasLeaderCreator = model.hasLeaderCreator;
        entity.workspace = model.workspace;
        entity.submitter = new User();
        entity.submitter.id = model.submitter.id;
        entity.organization = new Organization();
        entity.organization.id = model.organization.id;
        return entity;
    }

    static valuesOf(models: IdeaModel[]): Idea[] {
        const entities: Idea[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    setSubmitter(submitters: User[]) {
        const result = submitters.find(submitter => this.submitter.id === submitter.id);
        result !== undefined ? this.submitter = result : null;
    }

}
