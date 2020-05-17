import { ContentModel } from '../_models/content.model';

import { Organization } from './organization';

export class Content extends ContentModel {
    
    organizations: Organization[];
    
    static fromModel(model: ContentModel): Content {
        var entity = new Content();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.name = model.name;
        entity.value = model.value;
        return entity;
    }

    static fromModels(models: ContentModel[]): Content[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }
}
