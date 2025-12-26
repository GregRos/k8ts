import type { External, Resource_Ctor_Of } from "../resource"
import { Origin_Entity } from "./entity"
import type { Origin_Props } from "./node"
/**
 * Used as the Origin of {@link External} resources. These resources are never manifested by k8ts.
 * They're expected to already exist in the target cluster.
 */
export class Origin_External extends Origin_Entity {
    get kind() {
        return "[k8ts] External"
    }
    private constructor() {
        super("External", {})
    }

    protected __parent__(): Origin_Entity<Origin_Props<Resource_Ctor_Of>> | undefined {
        return undefined
    }

    static instance = new Origin_External()
}
