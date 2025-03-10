import { ChildOrigin, type LiveRefable, type Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata/."
import {
    ConfigMap,
    Deployment,
    HttpRoute,
    Namespace,
    Persistent,
    PodTemplate,
    Secret,
    Service
} from "../resources"
import type { FileOrigin } from "./origin"

export type Factory = Factory.Factory
export namespace Factory {
    export type Factory = Cluster | Namespaced
    export type FromScope<FScope extends FileOrigin.Scope> = FScope extends "cluster"
        ? Cluster
        : Namespaced

    export class Base {
        constructor(readonly origin: Origin) {}

        protected _metaWithName(name: string) {
            return this.origin.meta.add({
                name
            })
        }

        child(name: string, meta: Meta.Input) {
            const childOrigin = new ChildOrigin(name, Meta.make(meta), this.origin)
            return new (this.constructor as any)(childOrigin)
        }
    }

    export class Cluster extends Base {
        PersistentVolume<Name extends string, Mode extends Persistent.DataMode = "Filesystem">(
            name: Name,
            props: Persistent.Volume.Props<Mode>
        ) {
            return new Persistent.Volume.Volume(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<Persistent.Volume<Mode>, Name>
        }
        Namespace<Name extends string>(name: Name, props?: Namespace.Props) {
            return new Namespace.Namespace(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<Namespace, Name>
        }
    }

    export class Namespaced extends Base {
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
            return new ConfigMap.ConfigMap(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<ConfigMap, Name>
        }
        Secret<Name extends string>(name: Name, props: Secret.Props) {
            return new Secret.Secret(this.origin, this._metaWithName(name), props) as LiveRefable<
                Secret,
                Name
            >
        }
        Service<Name extends string, Ports extends string>(
            name: Name,
            props: Service.Props<Ports>
        ) {
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
            return new HttpRoute.HttpRoute(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<HttpRoute<Ports>, Name>
        }
        PodTemplate<Name extends string, Ports extends string>(
            name: Name,
            props: PodTemplate.Props<Ports> | PodTemplate.Props<Ports>["POD"]
        ) {
            const props_ = typeof props === "function" ? { POD: props } : props
            return new PodTemplate.PodTemplate(
                this.origin,
                this._metaWithName(name),
                props_
            ) as LiveRefable<PodTemplate<Ports>, Name>
        }
    }
}
