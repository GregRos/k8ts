import { CDK } from "@k8ts/imports"
import { Kinded, Producer, SubResource } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { seq } from "doddle"
import { omitBy } from "lodash"
import { v1 } from "../../kinds/default"
import { Container } from "./container"
import { Device, Volume } from "./volume"
export type PodTemplate<Ports extends string = string> = PodTemplate.Pod_Template<Ports>
export namespace PodTemplate {
    export type Pod_Props_Original = Omit<CDK.PodSpec, "containers" | "initContainers" | "volumes">
    type Container_Ref<Ports extends string> = Kinded<v1.Pod.Container._> & {
        __PORTS__: Ports
    }
    export type Pod_Container_Producer<Ports extends string> = Producer<
        PodScope,
        Container_Ref<Ports>
    >

    export interface Pod_Props<Ports extends string> extends Pod_Props_Original {
        $POD: Pod_Container_Producer<Ports>
    }

    export class Pod_Template<Ports extends string = string> extends SubResource<Pod_Props<Ports>> {
        readonly meta = Meta.make()
        readonly kind = v1.PodTemplate._
        readonly containers = seq(() => this.props.$POD(new PodScope(this)))
            .map(x => {
                return x as Container<Ports>
            })
            .cache()
        readonly mounts = seq(() => this.containers.concatMap(x => x.mounts)).cache()
        readonly volumes = seq(() => this.containers.concatMap(x => x.volumes)).uniq()
        readonly ports = seq(() => this.containers.map(x => x.ports)).reduce((a, b) => a.union(b))

        protected __kids__() {
            return [...this.containers, ...this.volumes]
        }
        protected __metadata__() {
            return {
                name: this.name
            }
        }
        protected __post_construct__(): void {
            this.meta.overwrite({
                name: this.name
            })
        }
        protected __submanifest__(): CDK.PodTemplateSpec {
            const self = this
            const { props } = self
            const containers = self.containers
            const initContainers = containers
                .filter(c => c.subtype === "init")
                .map(x => x["__submanifest__"]())
                .toArray()
            const mainContainers = containers
                .filter(c => c.subtype === "main")
                .map(x => x["__submanifest__"]())
                .toArray()

            const volumes = self.volumes
                .map(x => {
                    if (x instanceof Volume.Pod_Volume) {
                        return x["__submanifest__"]()
                    }
                    return x["__submanifest__"]()
                })
                .toArray()
            return {
                spec: {
                    ...omitBy(props, (x, k) => k.startsWith("$")),
                    containers: mainContainers.pull(),
                    initContainers: initContainers.pull(),
                    volumes: volumes.pull()
                }
            }
        }
    }

    export class PodScope {
        constructor(private readonly _parent: Pod_Template) {}
        Container<Ports extends string>(name: string, options: Container.Container_Props<Ports>) {
            return new Container.Container(this._parent, name, "main", options)
        }
        InitContainer(name: string, options: Container.Container_Props<never>) {
            return new Container.Container(this._parent, name, "init", options)
        }
        Volume(name: string, options: Volume.Pod_Volume_Backend) {
            return Volume.make(this._parent, name, options)
        }
        Device(name: string, options: Device.Backend) {
            return Device.make(this._parent, name, options)
        }
    }
}
