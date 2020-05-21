import { SlackTeamModel } from '../_models/slack.team.model';

export class SlackTeam extends SlackTeamModel {

    static fromModel(model: SlackTeamModel): SlackTeam {
        var entity = new SlackTeam();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.teamId = model.teamId;
        entity.teamName = model.teamName;
        entity.publicationChannel = model.publicationChannel;
        return entity;
    }

}
