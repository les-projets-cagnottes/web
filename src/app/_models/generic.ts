
export class Generic {
    id: number;
    
    static valueOf(id: number): Generic {
        var generic = new Generic();
        generic.id = id;
        return generic;
    }
}