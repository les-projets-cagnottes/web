
export class GenericModel {
    id: number = 0;
    
    static valueOf(id: number): GenericModel {
        var generic = new GenericModel();
        generic.id = id;
        return generic;
    }
}