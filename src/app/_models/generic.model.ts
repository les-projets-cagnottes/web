
export class GenericModel {
    id: number;
    
    static valueOf(id: number): GenericModel {
        var generic = new GenericModel();
        generic.id = id;
        return generic;
    }
}