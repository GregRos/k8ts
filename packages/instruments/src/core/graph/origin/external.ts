import type { ExternalResource, ResourceConstructor } from "../resource"
import { Origin } from "./entity"
import type { Origin_Props } from "./node"
/**
 * Used as the Origin of {@link ExternalResource} resources. These resources are never manifested by
 * k8ts. They're expected to already exist in the target cluster.
 */
export class OriginExternal extends Origin {
    get ident() {
        return "[k8ts] External"
    }
    private constructor() {
        super("External", {})
    }

    protected __parent__(): Origin<Origin_Props<ResourceConstructor>> | undefined {
        return undefined
    }

    static instance = new OriginExternal()
}
