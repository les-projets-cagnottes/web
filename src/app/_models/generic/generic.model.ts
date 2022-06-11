
export class GenericModel {
    id = 0;
    
    static valueOf(id: number): GenericModel {
        const generic = new GenericModel();
        generic.id = id;
        return generic;
    }
}