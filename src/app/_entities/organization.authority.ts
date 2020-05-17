
import { OrganizationAuthorityModel } from '../_models';
import { Organization } from './organization';

export class OrganizationAuthority extends OrganizationAuthorityModel {

    organization: Organization = new Organization();
    
    static fromModel(model: OrganizationAuthorityModel): OrganizationAuthority {
        var entity = new OrganizationAuthority();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.name = model.name;
        entity.organization = new Organization();
        entity.organization.id = model.organization.id;
        return entity;
    }

    static fromModels(models: OrganizationAuthorityModel[]): OrganizationAuthority[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
