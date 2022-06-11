import { AuthorityModel } from '../../_models/authority/authority.model';

export class Authority extends AuthorityModel {
    
    static fromModel(model: AuthorityModel): Authority {
        const entity = new Authority();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.name = model.name;
        return entity;
    }

    static fromModels(models: AuthorityModel[]): Authority[] {
        const entities: Authority[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
