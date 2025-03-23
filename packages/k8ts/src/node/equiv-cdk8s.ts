import { Embedder, Kinded, LiveRefable } from "@k8ts/instruments"
import { Construct } from "constructs"

export type Cdk8sCtor = {
    new (parent: Construct, id: string, props: any): Construct
}
export type KindedCtor = new (...args: any[]) => Kinded
export const EquivCdk8s = new Embedder<LiveRefable, Cdk8sCtor>("CDK8S_RESOURCE")

export function equiv_cdk8s(ctor: Cdk8sCtor) {
    return <F extends KindedCtor>(target: F) => {
        const cdk8s = EquivCdk8s.tryGet(target.prototype)
        if (cdk8s) {
            throw new Error(`Target ${target} already has a cdk8s equivalent! ${cdk8s}`)
        }
        EquivCdk8s.set(target.prototype, ctor)
        return target
    }
}
