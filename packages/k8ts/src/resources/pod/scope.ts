import type { ResourceRef, ResourceRef_HasKeys } from "@k8ts/instruments"
import {
    type PodContainer_Props,
    type PodDeviceBackend,
    type PodVolume,
    type PodVolume_Backend,
    PodContainer,
    PodDevice
} from "../.."
import type { EnvValuePrimitive } from "../../env"
import { v1 } from "../../resource-idents"
import { K8tsResourceError } from "../errors"
import type { PodTemplate } from "./pod-template"
import {
    type PodVolume_Backend_ConfigMap,
    type PodVolume_Backend_HostPath,
    type PodVolume_Backend_Pvc,
    type PodVolume_Backend_Secret,
    PodVolume_ConfigMap,
    PodVolume_HostPath,
    PodVolume_Pvc,
    PodVolume_Secret
} from "./volume/volumes"

export class PodScope {
    constructor(private readonly _parent: PodTemplate) {}
    Container<
        Ports extends string,
        Env extends {
            [key in keyof Env]:
                | {
                      $backend: ResourceRef
                      key: Env[key] extends object
                          ? ResourceRef_HasKeys<Env[key]["$backend"], string>
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
        throw new K8tsResourceError(`Unsupported volume backend kind: ${backend.kind}`)
    }
    Device(name: string, options: PodDeviceBackend) {
        return new PodDevice(this._parent, name, options)
    }
}
