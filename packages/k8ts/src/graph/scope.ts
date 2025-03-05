import { ConfigMap, type ConfigMapProps } from "../resources/configmap/configmap"
import { Namespace, type NamespaceProps } from "../resources/namespace/namespace"
import type { PvMode } from "../resources/persistent/enums"
import { Pv, PvProps } from "../resources/persistent/pv"
import { Pvc, type PvcProps } from "../resources/persistent/pvc"
import { PodTemplate, type PodTemplateProps } from "../resources/pod/template"
import { Secret, type SecretProps } from "../resources/secret/secret"
import { ParentScope } from "./parent-scope"
import type { RefableOf } from "./referencing"

export class NamespacedScope extends ParentScope {
    Claim<Mode extends PvMode, Name extends string>(name: Name, mode: PvcProps<Mode>) {
        return new Pvc(this._prepareMeta(name), mode) as RefableOf<Pvc<Mode>, Name>
    }
    ConfigMap<Name extends string>(name: Name, props: ConfigMapProps) {
        return new ConfigMap(this._prepareMeta(name), props) as RefableOf<ConfigMap, Name>
    }
    Secret<Name extends string>(name: Name, props: SecretProps) {
        return new Secret(this._prepareMeta(name), props) as RefableOf<Secret, Name>
    }
    PodTemplate<Name extends string, Ports extends string>(
        name: Name,
        ports: PodTemplateProps<Ports>
    ) {
        return new PodTemplate(this._prepareMeta(name), ports) as RefableOf<
            PodTemplate<Ports>,
            Name
        >
    }
}

export class ClusterScope extends ParentScope {
    PersistentVolume<Mode extends PvMode, Name extends string>(name: Name, props: PvProps<Mode>) {
        return new Pv(this._prepareMeta(name), props) as RefableOf<Pv<Mode>, Name>
    }
    Namespace<Name extends string>(name: Name, props?: NamespaceProps) {
        return new Namespace(this._prepareMeta(name), props) as RefableOf<Namespace, Name>
    }
}
