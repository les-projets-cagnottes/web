import { OrganizationModel } from '../_models/organization.model';

import { Budget } from './budget';
import { Content } from './content';
import { OrganizationAuthority } from './organization.authority';
import { User } from './user';
import { SlackTeam } from './slack.team';

export class Organization extends OrganizationModel {

    slackTeam: SlackTeam = new SlackTeam();
    members: User[] = [];
    budgets: Budget[] = [];
    contents: Content[] = [];
    organizationAuthorities: OrganizationAuthority[] = [];

    // Defines if this organization is the current one for the logged in user
    isCurrent: boolean;

    static fromModel(model: OrganizationModel): Organization {
        var entity = new Organization();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.name = model.name;
        entity.logoUrl = model.logoUrl;
        entity.slackTeam = new SlackTeam();
        entity.slackTeam.id = model.slackTeam.id;
        entity.contentsRef = model.contentsRef;
        entity.membersRef = model.membersRef;
        return entity;
    }

    static fromModels(models: OrganizationModel[]): Organization[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
