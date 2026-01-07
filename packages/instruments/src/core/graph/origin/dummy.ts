import type { DummyResource, ResourceRef_Constructor } from "../resource"
import type { Origin_Props } from "./node"
import { Origin } from "./origin"
/**
 * Used as the Origin of {@link DummyResource} resources. These resources are never manifested by
 * k8ts. They're expected to already exist in the target cluster.
 */
export class DummyOrigin extends Origin {
    get kind() {
        return "[k8ts] External"
    }
    private constructor() {
        super("External", {})
    }

    protected __parent__(): Origin<Origin_Props<ResourceRef_Constructor>> | undefined {
        return undefined
    }

    static instance = new DummyOrigin()
}
