import { Ref2_Of, Resource_Child, type Resource_Ref_Keys_Of } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { CDK } from "@k8ts/sample-interfaces"
import { doddlify, seq } from "doddle"
import { omitBy } from "lodash"
import type { Env_Value } from "../../env/types"
import { v1 } from "../../kinds/default"
import { Container, type Container_Props } from "./container"
import { Pod_Device, type Pod_Device_Backend } from "./volume/devices"
import {
    Pod_Volume,
    Pod_Volume_ConfigMap,
    Pod_Volume_HostPath,
    Pod_Volume_Pvc,
    Pod_Volume_Secret,
    type Pod_Volume_Backend,
    type Pod_Volume_Backend_ConfigMap,
    type Pod_Volume_Backend_HostPath,
    type Pod_Volume_Backend_Pvc,
    type Pod_Volume_Backend_Secret
} from "./volume/volumes"
export type Pod_Props_Original = Omit<CDK.PodSpec, "containers" | "initContainers" | "volumes">
type Container_Ref<Ports extends string> = Ref2_Of<v1.Pod.Container._> & {
    __PORTS__: Ports
}
export type Pod_Container_Producer<Ports extends string> = (
    scope: PodScope
) => Iterable<Container_Ref<Ports>>

export interface Pod_Props<Ports extends string> extends Pod_Props_Original {
    meta?: Meta.Input
    $POD: Pod_Container_Producer<Ports>
}

export class Pod_Template<Ports extends string = string> extends Resource_Child<Pod_Props<Ports>> {
    get kind() {
        return v1.PodTemplate._
    }
    private readonly _containers = seq(() => this.props.$POD(new PodScope(this)))
        .as<Container<Ports>>()
        .cache()

    private readonly _mounts = seq(() => this._containers.concatMap(x => x.mounts))
        .uniq()
        .cache()
    private readonly _volumes = seq(() => this._containers.concatMap(x => x.volumes))
        .uniq()
        .cache()

    private readonly _ports = this._containers.map(x => x.ports).reduce((a, b) => a.union(b))

    get containers() {
        return this._containers as Iterable<Container<Ports>>
    }
    @doddlify
    get mounts() {
        return this._mounts as Iterable<any>
    }

    @doddlify
    get volumes() {
        return this._containers.concatMap(x => x.volumes).uniq() as Iterable<
            Container["volumes"][number]
        >
    }

    @doddlify
    get ports() {
        return this._containers
            .map(x => x.ports)
            .reduce((a, b) => a.union(b))
            .pull()
    }

    protected __kids__() {
        return [...this._containers, ...this.volumes]
    }
    protected __metadata__() {
        return {
            name: this.name,
            labels: this.meta.labels,
            annotations: this.meta.annotations
        }
    }
    readonly meta = Meta.make(this.props.meta ?? {}).add("name", this.name)

    protected __submanifest__(): CDK.PodTemplateSpec {
        const self = this
        const { props } = self
        const containers = self._containers
        const initContainers = containers
            .filter(c => c.subtype === "init")
            .map(x => x["__submanifest__"]())
            .toArray()
        const mainContainers = containers
            .filter(c => c.subtype === "main")
            .map(x => x["__submanifest__"]())
            .toArray()

        const volumes = self._volumes
            .map(x => {
                if (x.is(Pod_Volume)) {
                    return x["__submanifest__"]()
                } else if (x.is(Pod_Device)) {
                    return x["__submanifest__"]()
                }
                throw new Error(`Unsupported volume type: ${x}`)
            })
            .toArray()
        return {
            metadata: self.__metadata__(),
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
    Container<
        Ports extends string,
        Env extends {
            [key in keyof Env]:
                | {
                      $backend: Ref2_Of
                      key: Env[key] extends object
                          ? Resource_Ref_Keys_Of<Env[key]["$backend"], string>
                          : never
                  }
                | Env_Value
        }
    >(name: string, options: Container_Props<Ports, Env>) {
        return new Container(this._parent, name, "main", options)
    }
    InitContainer(name: string, options: Container_Props<never>) {
        return new Container(this._parent, name, "init", options)
    }
    Volume<const P extends Pod_Volume_Backend_HostPath>(name: string, options: P): Pod_Volume<P>
    Volume<const P extends Pod_Volume_Backend_ConfigMap<Ref2_Of<v1.ConfigMap._>>>(
        name: string,
        options: P
    ): Pod_Volume<P>
    Volume<const P extends Pod_Volume_Backend_Secret<Ref2_Of<v1.Secret._>>>(
        name: string,
        options: P
    ): Pod_Volume<P>
    Volume<const P extends Pod_Volume_Backend_Pvc<Ref2_Of<v1.PersistentVolumeClaim._>>>(
        name: string,
        options: P
    ): Pod_Volume<P>
    Volume(name: string, options: Pod_Volume_Backend): Pod_Volume {
        {
            const backend = options.$backend
            if (backend.kind === "HostPath") {
                return new Pod_Volume_HostPath(this._parent, name, options as any)
            }
        }
        const backend = options.$backend as Ref2_Of
        if (backend.is(v1.ConfigMap._)) {
            return new Pod_Volume_ConfigMap(this._parent, name, options as any)
        } else if (backend.is(v1.Secret._)) {
            return new Pod_Volume_Secret(this._parent, name, options as any)
        } else if (backend.is(v1.PersistentVolumeClaim._)) {
            return new Pod_Volume_Pvc(this._parent, name, options as any)
        }
        throw new Error(`Unsupported volume backend kind: ${backend.kind}`)
    }
    Device(name: string, options: Pod_Device_Backend) {
        return new Pod_Device(this._parent, name, options)
    }
}
