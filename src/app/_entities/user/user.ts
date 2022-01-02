
import { UserModel } from '../../_models';

import { ApiToken } from '../apitoken/apitoken';
import { Authority } from '../authority/authority';
import { Organization } from '../organization/organization';
import { OrganizationAuthority } from '../organization-authority/organization-authority';
import { SlackUser } from '../slack-user/slack-user';

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
        entity.userOrganizationAuthoritiesRef = model.userOrganizationAuthoritiesRef;
        return entity;
    }

    static fromModels(models: UserModel[]): User[] {
        var entities: User[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
