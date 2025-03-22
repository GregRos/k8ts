import { Embedder } from "@k8ts/instruments"
import { Construct } from "constructs"
import { ManifestResource } from "./manifest-resource"

export type Cdk8sCtor = {
    new (parent: Construct, id: string, props: any): Construct
}
export type ManifestResourceCtor = new (...args: any[]) => ManifestResource
export const EquivCdk8s = new Embedder<ManifestResource, Cdk8sCtor>("CDK8S_RESOURCE")

export function equiv_cdk8s(ctor: Cdk8sCtor) {
    return <F extends ManifestResourceCtor>(target: F) => {
        const cdk8s = EquivCdk8s.tryGet(target.prototype)
        if (cdk8s) {
            throw new Error(`Target ${target} already has a cdk8s equivalent! ${cdk8s}`)
        }
        EquivCdk8s.set(target.prototype, ctor)
        return target
    }
}
