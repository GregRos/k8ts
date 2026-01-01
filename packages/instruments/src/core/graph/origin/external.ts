import type { External, ResourceConstructor } from "../resource"
import { OriginEntity } from "./entity"
import type { OriginProps } from "./node"
/**
 * Used as the Origin of {@link External} resources. These resources are never manifested by k8ts.
 * They're expected to already exist in the target cluster.
 */
export class OriginExternal extends OriginEntity {
    get ident() {
        return "[k8ts] External"
    }
    private constructor() {
        super("External", {})
    }

    protected __parent__(): OriginEntity<OriginProps<ResourceConstructor>> | undefined {
        return undefined
    }

    static instance = new OriginExternal()
}
