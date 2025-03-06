import { type Refable } from "@k8ts/instruments"
import { Namespace, NamespaceProps } from "../resources/namespace"
import type { PvMode } from "../resources/persistent/enums"
import { Pv, PvProps } from "../resources/persistent/pv"
import { BaseScopeFactory } from "./k8ts-scope"
import { NamespaceScopeFactory } from "./namespace-scope"

export class ClusterScopeFactory extends BaseScopeFactory {
    PersistentVolume<Name extends string, Mode extends PvMode = "Filesystem">(
        name: Name,
        props: PvProps<Mode>
    ) {
        return new Pv(this.origin, this._metaWithName(name), props) as Refable<Pv<Mode>, Name>
    }
    Namespace<Name extends string>(name: Name, props?: NamespaceProps) {
        return new Namespace(this.origin, this._metaWithName(name), props) as Refable<
            Namespace,
            Name
        >
    }
    namespace(ns: Namespace) {
        return new NamespaceScopeFactory(
            this.origin,
            this.extra.add({
                namespace: ns.name
            })
        )
    }
}
