
import { ApiToken } from '../_models/apitoken';
import { Authority } from '../_models/authority';
import { OrganizationAuthority } from '../_models/organizationAuthority';
import { UserModel } from '../_models/user.model';

import { Organization } from './organization';
import { SlackUser } from '../_models/slackUser';

export class User extends UserModel {
    
    apitokens: ApiToken[] = [];
    userAuthorities: Authority[] = [];
    organizations: Organization[] = [];
    userOrganizationAuthorities: OrganizationAuthority[] = [];
    slackUsers: SlackUser[] = [];

    static fromModel(model: UserModel): User {
        var entity = new User();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.username = model.username;
        entity.email = model.email;
        entity.password = model.password;
        entity.firstname = model.firstname;
        entity.lastname = model.lastname;
        entity.avatarUrl = model.avatarUrl;
        entity.enabled = model.enabled;
        entity.token = model.token;
        return entity;
    }

    static fromModels(models: UserModel[]): User[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
