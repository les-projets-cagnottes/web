import { ProjectModel } from "src/app/_models/project/project.model";
import { Campaign, News, Organization, User } from "..";

export class Project extends ProjectModel {
    
    leader: User = new User();
    organization: Organization = new Organization();
    peopleGivingTime: User[] = [];
    campaigns: Campaign[] = [];
    news: News[] = [];

    static fromModel(model: ProjectModel): Project {
        var entity = new Project();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.title = model.title;
        entity.status = model.status;
        entity.shortDescription = model.shortDescription;
        entity.longDescription = model.longDescription;
        entity.peopleRequired = model.peopleRequired;
        entity.workspace = model.workspace;
        entity.peopleGivingTimeRef = model.peopleGivingTimeRef;
        entity.campaignsRef = model.campaignsRef;
        entity.organization = new Organization();
        entity.organization.id = model.organization.id;
        entity.leader = new User();
        entity.leader.id = model.leader.id;
        return entity;
    }

    static valuesOf(models: ProjectModel[]): Project[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

    static fromModels(models: ProjectModel[]): Project[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
