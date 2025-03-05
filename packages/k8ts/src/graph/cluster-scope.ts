import { type Refable } from "@k8ts/instruments"
import { Namespace, NamespaceProps } from "../resources/namespace/namespace"
import type { PvMode } from "../resources/persistent/enums"
import { Pv, PvProps } from "../resources/persistent/pv"
import { K8tsScope } from "./k8ts-scope"

export class ClusterScope extends K8tsScope {
    PersistentVolume<Mode extends PvMode, Name extends string>(name: Name, props: PvProps<Mode>) {
        return new Pv(this._prepareMeta(name), props) as Refable<Pv<Mode>, Name>
    }
    Namespace<Name extends string>(name: Name, props?: NamespaceProps) {
        return new Namespace(this._prepareMeta(name), props) as Refable<Namespace, Name>
    }
}
