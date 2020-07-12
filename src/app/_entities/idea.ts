import { IdeaModel } from '../_models';

import { Organization } from './organization';
import { User } from './user';

export class Idea extends IdeaModel {

    submitter: User = new User();
    organization: Organization = new Organization();
    followers: User[] = [];
    tags: any[] = [];

    static fromModel(model: IdeaModel): Idea {
        var entity = new Idea();
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
        entity.submitter = new User();
        entity.submitter.id = model.submitter.id;
        entity.organization = new Organization();
        entity.organization.id = model.organization.id;
        return entity;
    }

    static valuesOf(models: IdeaModel[]): Idea[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    setSubmitter(submitters: User[]) {
        var result = submitters.find(submitter => this.submitter.id === submitter.id);
        result !== undefined ? this.submitter = result : null;
    }

}
