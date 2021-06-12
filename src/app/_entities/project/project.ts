import { ProjectModel } from "src/app/_models/project/project.model";
import { Campaign, Organization, User } from "..";

export class Project extends ProjectModel {
    
    leader: User = new User();
    peopleGivingTime: User[] = [];
    organizations: Organization[] = [];
    campaigns: Campaign[] = [];

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
        entity.peopleGivingTimeRef = model.peopleGivingTimeRef;
        entity.organizationsRef = model.organizationsRef;
        entity.campaignsRef = model.campaignsRef;
        entity.leader = new User();
        entity.leader.id = model.leader.id;
        return entity;
    }

    static valuesOf(models: ProjectModel[]): Project[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }

}
