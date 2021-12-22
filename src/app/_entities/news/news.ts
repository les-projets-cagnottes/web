import { NewsModel } from "src/app/_models";
import { Organization } from "../organization/organization";
import { Project } from "../project/project";
import { User } from "../user";

export class News extends NewsModel {

    author: User = new User();
    organization: Organization = new Organization();
    project: Project = new Project();

    static fromModel(model: NewsModel): News {
        var entity = new News();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.title = model.title;
        entity.content = model.content;
        entity.workspace = model.workspace;
        entity.author = new User();
        entity.author.id = model.author.id;
        entity.organization = new Organization();
        entity.organization.id = model.organization.id;
        entity.project = new Project();
        entity.project.id = model.project.id;
        return entity;
    }

    static fromModels(models: NewsModel[]): News[] {
        var entities = [];
        models.forEach(model => entities.push(this.fromModel(model)));
        return entities;
    }


}
