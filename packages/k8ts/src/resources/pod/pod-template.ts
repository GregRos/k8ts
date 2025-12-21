import { CDK } from "@k8ts/imports"
import { Resource_Child, Resource_Min_Ref } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { seq } from "doddle"
import { omitBy } from "lodash"
import { v1 } from "../../kinds/default"
import { Container, type Container_Props } from "./container"
import { Pod_Device, type Pod_Device_Backend } from "./volume/devices"
import { Pod_Volume, type Pod_Volume_Backend } from "./volume/volumes"
export type Pod_Props_Original = Omit<CDK.PodSpec, "containers" | "initContainers" | "volumes">
type Container_Ref<Ports extends string> = Resource_Min_Ref<v1.Pod.Container._> & {
    __PORTS__: Ports
}
export type Pod_Container_Producer<Ports extends string> = (
    scope: PodScope
) => Iterable<Container_Ref<Ports>>

export interface Pod_Props<Ports extends string> extends Pod_Props_Original {
    $POD: Pod_Container_Producer<Ports>
}

export class Pod_Template<Ports extends string = string> extends Resource_Child<Pod_Props<Ports>> {
    get kind() {
        return v1.PodTemplate._
    }
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
    readonly meta = Meta.make({
        name: this.name
    })

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
                if (x instanceof Pod_Volume) {
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
    Container<Ports extends string>(name: string, options: Container_Props<Ports>) {
        return new Container(this._parent, name, "main", options)
    }
    InitContainer(name: string, options: Container_Props<never>) {
        return new Container(this._parent, name, "init", options)
    }
    Volume(name: string, options: Pod_Volume_Backend) {
        return Pod_Volume.make(this._parent, name, options)
    }
    Device(name: string, options: Pod_Device_Backend) {
        return new Pod_Device(this._parent, name, options)
    }
}
