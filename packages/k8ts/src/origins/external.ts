import { Origin_Exporter, type Origin_Entity } from "@k8ts/instruments"

export class ExternalOriginEntity extends Origin_Exporter {
    get kind() {
        return "External"
    }
    constructor(parent: Origin_Entity) {
        super(parent, "External", {
            *exports() {}
        })
    }
}
