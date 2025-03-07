import { type LiveRefable } from "@k8ts/instruments"
import { ConfigMap, Deployment, HttpRoute, Persistent, Secret, Service } from "../resources"
import { PodTemplate, PodTemplateProps } from "../resources/pod/template"
import { BaseFactory } from "./k8ts-scope"

export class Namespaced<Name extends string = string> extends BaseFactory {
    Claim<Mode extends Persistent.DataMode, Name extends string>(
        name: Name,
        mode: Persistent.Claim.Props<Mode>
    ) {
        return new Persistent.Claim.Claim(
            this.origin,
            this._metaWithName(name),
            mode
        ) as LiveRefable<Persistent.Claim<Mode>, Name>
    }
    ConfigMap<Name extends string>(name: Name, props: ConfigMap.Props) {
        return new ConfigMap.ConfigMap(this.origin, this._metaWithName(name), props) as LiveRefable<
            ConfigMap,
            Name
        >
    }
    Secret<Name extends string>(name: Name, props: Secret.Props) {
        return new Secret.Secret(this.origin, this._metaWithName(name), props) as LiveRefable<
            Secret,
            Name
        >
    }
    Service<Name extends string, Ports extends string>(name: Name, props: Service.Props<Ports>) {
        return new Service.Service(this.origin, this._metaWithName(name), props) as LiveRefable<
            Service<Ports>,
            Name
        >
    }

    Deployment<Name extends string, Ports extends string>(
        name: Name,
        props: Deployment.Props<Ports>
    ) {
        return new Deployment.Deployment(
            this.origin,
            this._metaWithName(name),
            props
        ) as LiveRefable<Deployment<Ports>, Name>
    }

    DomainRoute<Name extends string, Ports extends string>(
        name: Name,
        props: HttpRoute.Props<Ports>
    ) {
        return new HttpRoute.HttpRoute(this.origin, this._metaWithName(name), props) as LiveRefable<
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
