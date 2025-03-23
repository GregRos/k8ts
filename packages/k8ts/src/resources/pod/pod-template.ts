import { Kinded, manifest, Producer, relations } from "@k8ts/instruments"
import { seq } from "doddle"
import { omit } from "lodash"
import { CDK } from "../../_imports"
import { k8ts } from "../../kind-map"
import { api } from "../../kinds"
import { ManifestResource } from "../../node/manifest-resource"
import { Container } from "./container"
import { Device, Volume } from "./volume"
export type PodTemplate<Ports extends string = string> = PodTemplate.PodTemplate<Ports>
export namespace PodTemplate {
    export type PodProps = Omit<CDK.PodSpec, "containers" | "initContainers" | "volumes">
    type AbsContainer<Ports extends string> = Kinded<api.v1_.Pod_.Container> & {
        __PORTS__: Ports
    }
    export type PodContainerProducer<Ports extends string> = Producer<PodScope, AbsContainer<Ports>>
    export type Props<Ports extends string> = PodProps & {
        POD: PodContainerProducer<Ports>
    }
    @k8ts(api.v1_.PodTemplate)
    @relations({
        kids: s => [...s.containers, ...s.volumes]
    })
    @manifest({
        body(self): CDK.PodTemplateSpec {
            const { meta, props } = self
            const containers = self.containers
            const initContainers = containers
                .filter(c => c.subtype === "init")
                .map(x => x.submanifest())
                .toArray()
            const mainContainers = containers
                .filter(c => c.subtype === "main")
                .map(x => x.submanifest())
                .toArray()

            const volumes = self.volumes.map(x => x.submanifest()).toArray()
            return {
                spec: {
                    ...omit(props, "POD"),
                    containers: mainContainers.pull(),
                    initContainers: initContainers.pull(),
                    volumes: volumes.pull()
                }
            }
        }
    })
    export class PodTemplate<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        readonly kind = api.v1_.PodTemplate
        readonly containers = seq(() => this.props.POD(new PodScope(this)))
            .map(x => {
                return x as Container<Ports>
            })
            .cache()
        readonly mounts = seq(() => this.containers.concatMap(x => x.mounts)).cache()
        readonly volumes = seq(() => this.containers.concatMap(x => x.volumes)).uniq()
        readonly ports = seq(() => this.containers.map(x => x.ports)).reduce((a, b) => a.union(b))
    }

    export class PodScope {
        constructor(private readonly _parent: PodTemplate) {}
        Container<Ports extends string>(name: string, options: Container.Props<Ports>) {
            return new Container.Container(this._parent, name, "main", options)
        }
        InitContainer(name: string, options: Container.K8tsProps<never>) {
            return new Container.Container(this._parent, name, "init", options)
        }
        Volume(name: string, options: Volume.Backend) {
            return Volume.make(this._parent, name, options)
        }
        Device(name: string, options: Device.Backend) {
            return Device.make(this._parent, name, options)
        }
    }
}
