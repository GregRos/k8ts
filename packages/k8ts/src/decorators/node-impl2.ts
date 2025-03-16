import { NeedsEdge, ResourceNodeImplTypes } from "@k8ts/instruments"
import { seq } from "doddle"
import { ManifestResource } from "../node"
import { AbsResource } from "../node/abs-resource"
import { InputDecoritized, ObjectMixinDecorator } from "./base"

export type TypeInputs = {
    parent: AbsResource | null
    kids: AbsResource[]
    needs: Record<string, ManifestResource>
}
const manager = new ObjectMixinDecorator<AbsResource, TypeInputs, ResourceNodeImplTypes>(
    "nodeImplementation",
    {
        parent(x) {
            return x?.node ?? null
        },
        kids(x) {
            return seq(x ?? []).map(it => it.node)
        },
        needs(x) {
            return Object.entries(x ?? {}).map(([k, v]) => new NeedsEdge(k, v.node))
        }
    }
)
export function connections<F extends { new (...args: any[]): AbsResource }>(
    thing: InputDecoritized<InstanceType<F>, TypeInputs>
) {
    return (ctor: F) => {
        manager.set(ctor.prototype, thing as any)
        return ctor
    }
}
