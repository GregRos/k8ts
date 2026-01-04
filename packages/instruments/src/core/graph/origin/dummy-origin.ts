import type { DummyResource, ResourceRef_Constructor } from "../resource"
import { Origin } from "./origin"
import type { Origin_Props } from "./origin-node"
/**
 * Used as the Origin of {@link DummyResource} resources. These resources are never manifested by
 * k8ts. They're expected to already exist in the target cluster.
 */
export class DummyOrigin extends Origin {
    get ident() {
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
