import { Origin_Entity, type Origin_Props, type Resource_Ctor_Of } from "@k8ts/instruments"

export class Origin_External extends Origin_Entity {
    get kind() {
        return "External"
    }
    constructor(readonly _parent: Origin_Entity) {
        super("External", {})
    }

    protected __parent__(): Origin_Entity<Origin_Props<Resource_Ctor_Of>> | undefined {
        return this._parent
    }
}
