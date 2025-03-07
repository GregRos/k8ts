import { type LiveRefable } from "@k8ts/instruments"
import { Deployment, HttpRoute, type DeploymentProps, type HttpRouteProps } from "../resources"
import { ConfigMap, ConfigMapProps } from "../resources/configmap/configmap"
import { PvMode } from "../resources/persistent/enums"
import { Pvc, PvcProps } from "../resources/persistent/pvc"
import { PodTemplate, PodTemplateProps } from "../resources/pod/template"
import { Secret, SecretProps } from "../resources/secret"
import { Service, type ServiceProps } from "../resources/service"
import { BaseScopeFactory } from "./k8ts-scope"

export class Namespaced_Factory<Name extends string = string> extends BaseScopeFactory {
    Claim<Mode extends PvMode, Name extends string>(name: Name, mode: PvcProps<Mode>) {
        return new Pvc(this.origin, this._metaWithName(name), mode) as LiveRefable<Pvc<Mode>, Name>
    }
    ConfigMap<Name extends string>(name: Name, props: ConfigMapProps) {
        return new ConfigMap(this.origin, this._metaWithName(name), props) as LiveRefable<
            ConfigMap,
            Name
        >
    }
    Secret<Name extends string>(name: Name, props: SecretProps) {
        return new Secret(this.origin, this._metaWithName(name), props) as LiveRefable<Secret, Name>
    }
    Service<Name extends string, Ports extends string>(name: Name, props: ServiceProps<Ports>) {
        return new Service(this.origin, this._metaWithName(name), props) as LiveRefable<
            Service<Ports>,
            Name
        >
    }

    Deployment<Name extends string, Ports extends string>(
        name: Name,
        props: DeploymentProps<Ports>
    ) {
        return new Deployment(this.origin, this._metaWithName(name), props) as LiveRefable<
            Deployment<Ports>,
            Name
        >
    }

    DomainRoute<Name extends string, Ports extends string>(
        name: Name,
        props: HttpRouteProps<Ports>
    ) {
        return new HttpRoute(this.origin, this._metaWithName(name), props) as LiveRefable<
            HttpRoute<Ports>,
            Name
        >
    }
    PodTemplate<Name extends string, Ports extends string>(
        name: Name,
        props: PodTemplateProps<Ports> | PodTemplateProps<Ports>["POD"]
    ) {
        const props_ = typeof props === "function" ? { POD: props } : props
        return new PodTemplate(this.origin, this._metaWithName(name), props_) as LiveRefable<
            PodTemplate<Ports>,
            Name
        >
    }
}
