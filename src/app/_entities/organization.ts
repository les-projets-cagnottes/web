import { Content } from '../_models/content';
import { OrganizationModel } from '../_models/organization.model';
import { OrganizationAuthority } from '../_models/organizationAuthority';
import { SlackTeam } from '../_models/slackTeam';

import { Budget } from './budget';
import { User } from './user';

export class Organization extends OrganizationModel {

    slackTeam: SlackTeam = new SlackTeam();
    members: User[] = [];
    budgets: Budget[] = [];
    contents: Content[] = [];
    organizationAuthorities: OrganizationAuthority[] = [];

    static fromModel(model: OrganizationModel): Organization {
        var entity = new Organization();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.name = model.name;
        entity.slackTeam = new SlackTeam();
        entity.slackTeam.id = model.slackTeam.id;
        entity.membersRef = model.membersRef;
        return entity;
    }

    static fromModels(models: OrganizationModel[]): Organization[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
