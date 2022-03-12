import { OrganizationModel } from '../../_models/organization/organization.model';

import { Budget } from '../budget/budget';
import { Content } from '../content/content';
import { OrganizationAuthority } from '../organization-authority/organization-authority';
import { User } from '../user/user';
import { SlackTeam } from '../slack-team/slack-team';
import { MsTeam } from '..';

export class Organization extends OrganizationModel {

    override slackTeam: SlackTeam = new SlackTeam();
    override msTeam: MsTeam = new MsTeam();
    members: User[] = [];
    budgets: Budget[] = [];
    contents: Content[] = [];
    organizationAuthorities: OrganizationAuthority[] = [];

    // Defines if this organization is the current one for the logged in user
    isCurrent = false;

    static fromModel(model: OrganizationModel): Organization {
        const entity = new Organization();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.name = model.name;
        entity.socialName = model.socialName;
        entity.logoUrl = model.logoUrl;
        entity.slackTeam = new SlackTeam();
        entity.slackTeam.id = model.slackTeam.id;
        entity.msTeam = new MsTeam();
        entity.msTeam.id = model.msTeam.id;
        entity.contentsRef = model.contentsRef;
        entity.membersRef = model.membersRef;
        return entity;
    }

    static fromModels(models: OrganizationModel[]): Organization[] {
        const entities: Organization[] = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
