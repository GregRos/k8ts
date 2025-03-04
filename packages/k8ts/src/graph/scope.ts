import type { Meta } from "@k8ts/metadata/."
import { ConfigMap } from "../resources/configmap/configmap"
import { Namespace } from "../resources/namespace/namespace"
import { Pv } from "../resources/persistent/pv"
import { Pvc } from "../resources/persistent/pvc"
import { Secret } from "../resources/secret/secret"
import type { Base } from "./base"
import { DelayedResources } from "./delayed"

export class ParentScope {
    constructor(private readonly _meta: Meta) {}

    protected _createFactory<Props extends object, Out>(ctor: {
        new (meta: Meta, props: Props): Out
    }) {
        return (name: string, props: Props) => new ctor(this._meta.add("name", name), props)
    }

    define<T extends Base>(generator: (scope: this) => Iterable<T>) {
        return DelayedResources.of(() => generator(this))
    }
}

export class NamespacedScope extends ParentScope {
    Claim = this._createFactory(Pvc)
    ConfigMap = this._createFactory(ConfigMap)
    Secret = this._createFactory(Secret)
}

export class ClusterScope extends ParentScope {
    PersistentVolume = this._createFactory(Pv)
    Namespace = this._createFactory(Namespace)
}
