import { type Refable } from "@k8ts/instruments"
import { Deployment, HttpRoute, type DeploymentProps, type HttpRouteProps } from "../resources"
import { ConfigMap, ConfigMapProps } from "../resources/configmap/configmap"
import { PvMode } from "../resources/persistent/enums"
import { Pvc, PvcProps } from "../resources/persistent/pvc"
import { PodTemplate, PodTemplateProps } from "../resources/pod/template"
import { Secret, SecretProps } from "../resources/secret"
import { Service, type ServiceProps } from "../resources/service"
import { BaseScopeFactory } from "./k8ts-scope"

export class NamespaceScopeFactory extends BaseScopeFactory {
    Claim<Mode extends PvMode, Name extends string>(name: Name, mode: PvcProps<Mode>) {
        return new Pvc(this.origin, this._metaWithName(name), mode) as Refable<Pvc<Mode>, Name>
    }
    ConfigMap<Name extends string>(name: Name, props: ConfigMapProps) {
        return new ConfigMap(this.origin, this._metaWithName(name), props) as Refable<
            ConfigMap,
            Name
        >
    }
    Secret<Name extends string>(name: Name, props: SecretProps) {
        return new Secret(this.origin, this._metaWithName(name), props) as Refable<Secret, Name>
    }
    Service<Name extends string, Ports extends string>(name: Name, props: ServiceProps<Ports>) {
        return new Service(this.origin, this._metaWithName(name), props) as Refable<
            Service<Ports>,
            Name
        >
    }

    Deployment<Name extends string, Ports extends string>(
        name: Name,
        props: DeploymentProps<Ports>
    ) {
        return new Deployment(this.origin, this._metaWithName(name), props) as Refable<
            Deployment<Ports>,
            Name
        >
    }

    DomainRoute<Name extends string, Ports extends string>(
        name: Name,
        props: HttpRouteProps<Ports>
    ) {
        return new HttpRoute(this.origin, this._metaWithName(name), props) as Refable<
            HttpRoute<Ports>,
            Name
        >
    }
    PodTemplate<Name extends string, Ports extends string>(
        name: Name,
        ports: PodTemplateProps<Ports>
    ) {
        return new PodTemplate(this.origin, this._metaWithName(name), ports) as Refable<
            PodTemplate<Ports>,
            Name
        >
    }
}
