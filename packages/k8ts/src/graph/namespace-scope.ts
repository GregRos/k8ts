import { type Refable } from "@k8ts/instruments"
import { ConfigMap, ConfigMapProps } from "../resources/configmap/configmap"
import { PvMode } from "../resources/persistent/enums"
import { Pvc, PvcProps } from "../resources/persistent/pvc"
import { PodTemplate, PodTemplateProps } from "../resources/pod/template"
import { Secret, SecretProps } from "../resources/secret/secret"
import { K8tsScope } from "./k8ts-scope"

export class NamespacedScope extends K8tsScope {
    Claim<Mode extends PvMode, Name extends string>(name: Name, mode: PvcProps<Mode>) {
        return new Pvc(this._prepareMeta(name), mode) as Refable<Pvc<Mode>, Name>
    }
    ConfigMap<Name extends string>(name: Name, props: ConfigMapProps) {
        return new ConfigMap(this._prepareMeta(name), props) as Refable<ConfigMap, Name>
    }
    Secret<Name extends string>(name: Name, props: SecretProps) {
        return new Secret(this._prepareMeta(name), props) as Refable<Secret, Name>
    }
    PodTemplate<Name extends string, Ports extends string>(
        name: Name,
        ports: PodTemplateProps<Ports>
    ) {
        return new PodTemplate(this._prepareMeta(name), ports) as Refable<PodTemplate<Ports>, Name>
    }
}
