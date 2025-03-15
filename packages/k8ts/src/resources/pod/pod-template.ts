import { CDK } from "@imports"
import { seq } from "doddle"
import { omit } from "lodash"
import { apps_v1 } from "../../api-versions"
import { AbsResource } from "../../node/abs-resource"
import { ManifestResource } from "../../node/manifest-resource"
import { K8tsResources } from "../kind-map"
import { Container } from "./container"
import { Device, Volume } from "./volume"
export type PodTemplate<Ports extends string> = PodTemplate.PodTemplate<Ports>
export namespace PodTemplate {
    export type Props<Ports extends string> = Omit<
        CDK.PodSpec,
        "containers" | "initContainers" | "volumes"
    > & {
        POD(scope: PodScope): Iterable<Container.Container<Ports>>
    }
    const ident = apps_v1.kind("PodTemplate")
    @K8tsResources.register(ident)
    export class PodTemplate<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        api = ident
        readonly containers = seq(() => this.props.POD(new PodScope(this))).cache()
        readonly mounts = seq(() => this.containers.concatMap(x => x.mounts)).cache()
        readonly ports = seq(() => this.containers.map(x => x.ports)).reduce((a, b) => a.union(b))

        override get subResources(): AbsResource[] {
            return [...this.containers, ...this.mounts.map(x => x.mount.parent)]
        }
        manifestBody(): CDK.PodTemplateSpec {
            const { meta, props } = this
            const containers = this.containers
            const initContainers = containers
                .filter(c => c.subtype === "init")
                .map(x => x.manifest())
                .toArray()
            const mainContainers = containers
                .filter(c => c.subtype === "main")
                .map(x => x.manifest())
                .toArray()

            const volumes = containers
                .concatMap(x => x.volumes)
                .map(x => x.manifest())
                .toArray()
            return {
                metadata: this.metadata(),
                spec: {
                    ...omit(props, "POD"),
                    containers: mainContainers.pull(),
                    initContainers: initContainers.pull(),
                    volumes: volumes.pull()
                }
            }
        }
    }

    export class PodScope {
        constructor(private readonly _parent: PodTemplate) {}
        Container<Ports extends string>(
            name: string,
            options: Container.Props<Ports>
        ): Container<Ports> {
            return Container.make(this._parent, name, "main", options)
        }
        InitContainer(name: string, options: Container.Props<never>): Container<never> {
            return Container.make(this._parent, name, "init", options)
        }
        Volume(name: string, options: Volume.Backend) {
            return Volume.make(this._parent, name, options)
        }
        Device(name: string, options: Device.Backend): Device {
            return Device.make(this._parent, name, options)
        }
    }
}
