
import { OrganizationAuthorityModel } from '../../_models';
import { Organization } from '../organization/organization';

export class OrganizationAuthority extends OrganizationAuthorityModel {

    override organization: Organization = new Organization();
    
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
        var entities: OrganizationAuthority[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
