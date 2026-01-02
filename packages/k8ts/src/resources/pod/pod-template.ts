import { ResourcePart, ResourceRef, type KeysResourceRef } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { CDK } from "@k8ts/sample-interfaces"
import { seq } from "doddle"
import { omitBy } from "lodash"
import type { EnvValuePrimitive } from "../../env/types"
import { v1 } from "../idents/default"
import { PodContainer, type PodContainer_Props } from "./container"
import { PodDevice, type PodDeviceBackend } from "./volume/devices"
import {
    PodVolume,
    PodVolume_ConfigMap,
    PodVolume_HostPath,
    PodVolume_Pvc,
    PodVolume_Secret,
    type PodVolume_Backend,
    type PodVolume_Backend_ConfigMap,
    type PodVolume_Backend_HostPath,
    type PodVolume_Backend_Pvc,
    type PodVolume_Backend_Secret
} from "./volume/volumes"
export type PodPropsOriginal = Omit<CDK.PodSpec, "containers" | "initContainers" | "volumes">
type ContainerRef<Ports extends string> = ResourceRef<v1.Pod.Container._> & {
    __PORTS__: Ports
}
export type PodContainerProducer<Ports extends string> = (
    scope: PodScope
) => Iterable<ContainerRef<Ports>>

export interface PodProps<Ports extends string> extends PodPropsOriginal {
    meta?: Meta.Input
    $POD: PodContainerProducer<Ports>
}

export class PodTemplate<Ports extends string = string> extends ResourcePart<PodProps<Ports>> {
    get ident() {
        return v1.PodTemplate._
    }
    private readonly _containers = seq(() => this.props.$POD(new PodScope(this)))
        .as<PodContainer<Ports>>()
        .cache()

    private readonly _mounts = seq(() => this._containers.concatMap(x => x.mounts))
        .uniq()
        .cache()
    private readonly _volumes = seq(() => this._containers.concatMap(x => x.volumes))
        .uniq()
        .cache()
    private readonly _ports = this._containers.map(x => x.ports).reduce((a, b) => a.union(b))

    get containers() {
        return this._containers.toIterable()
    }
    get mounts() {
        return this._mounts.toIterable()
    }

    get volumes() {
        return this._volumes.toIterable()
    }

    get ports() {
        return this._ports.pull()
    }

    protected __kids__() {
        this._containers.toArray().pull()
        return super.__kids__()
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
                if (x.is(PodVolume)) {
                    return x["__submanifest__"]()
                } else if (x.is(PodDevice)) {
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
    constructor(private readonly _parent: PodTemplate) {}
    Container<
        Ports extends string,
        Env extends {
            [key in keyof Env]:
                | {
                      $backend: ResourceRef
                      key: Env[key] extends object
                          ? KeysResourceRef<Env[key]["$backend"], string>
                          : never
                  }
                | EnvValuePrimitive
        }
    >(name: string, options: PodContainer_Props<Ports, Env>) {
        return new PodContainer(this._parent, name, "main", options)
    }
    InitContainer(name: string, options: PodContainer_Props<never>) {
        return new PodContainer(this._parent, name, "init", options)
    }
    Volume<const P extends PodVolume_Backend_HostPath>(name: string, options: P): PodVolume<P>
    Volume<const P extends PodVolume_Backend_ConfigMap<ResourceRef<v1.ConfigMap._>>>(
        name: string,
        options: P
    ): PodVolume<P>
    Volume<const P extends PodVolume_Backend_Secret<ResourceRef<v1.Secret._>>>(
        name: string,
        options: P
    ): PodVolume<P>
    Volume<const P extends PodVolume_Backend_Pvc<ResourceRef<v1.PersistentVolumeClaim._>>>(
        name: string,
        options: P
    ): PodVolume<P>
    Volume(name: string, options: PodVolume_Backend): PodVolume {
        {
            const backend = options.$backend
            if ("kind" in backend && backend.kind === "HostPath") {
                return new PodVolume_HostPath(this._parent, name, options as any)
            }
        }
        const backend = options.$backend as ResourceRef
        if (backend.is(v1.ConfigMap._)) {
            return new PodVolume_ConfigMap(this._parent, name, options as any)
        } else if (backend.is(v1.Secret._)) {
            return new PodVolume_Secret(this._parent, name, options as any)
        } else if (backend.is(v1.PersistentVolumeClaim._)) {
            return new PodVolume_Pvc(this._parent, name, options as any)
        }
        throw new Error(`Unsupported volume backend kind: ${backend.ident}`)
    }
    Device(name: string, options: PodDeviceBackend) {
        return new PodDevice(this._parent, name, options)
    }
}
