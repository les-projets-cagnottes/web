import { ContentModel } from '../../_models/content/content.model';

import { Organization } from '../organization/organization';

export class Content extends ContentModel {
    
    override organization: Organization = new Organization();
    
    static fromModel(model: ContentModel): Content {
        var entity = new Content();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.name = model.name;
        entity.value = model.value;
        entity.workspace = model.workspace;
        entity.organization = new Organization();
        entity.organization.id = model.organization.id;
        return entity;
    }

    static fromModels(models: ContentModel[]): Content[] {
        var entities: Content[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }
}
