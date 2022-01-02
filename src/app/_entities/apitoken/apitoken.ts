
import { ApiTokenModel } from '../../_models';
import { User } from '../user/user';

export class ApiToken extends ApiTokenModel {
    override user: User = new User();
    
    static fromModel(model: ApiTokenModel): ApiToken {
        var entity = new ApiToken();
        entity.id = model.id;
        entity.createdAt = model.createdAt;
        entity.createdBy = model.createdBy;
        entity.updatedAt = model.updatedAt;
        entity.updatedBy = model.updatedBy;
        entity.expiration = model.expiration;
        entity.token = model.token;
        entity.user = new User();
        entity.user.id = model.user.id;
        return entity;
    }
}