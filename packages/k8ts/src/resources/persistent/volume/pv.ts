import {
    K8sResource,
    ResourceRef,
    toCdkQuantityRecord,
    Units,
    type Resource_Props_Top
} from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { merge } from "lodash"
import { v1 } from "../../../gvks/default"
import { storage } from "../../../gvks/storage"
import { K8tsResourceError } from "../../errors"
import type { HostPath_Type } from "../../hostpath"
import { parsePvAccessMode, type PvAccessMode_Many } from "../access-mode"
import type { PvVolumeMode } from "../volume-mode"
import { parseBackend } from "./parse-backend"

const StorageClassKind = storage.v1.StorageClass._

export interface Pv_Backend_HostPath {
    kind: "HostPath"
    type: HostPath_Type
    path: string
}
export interface Pv_Backend_Local {
    kind: "Local"
    path: string
}
export interface Pv_Backend_NFS {
    kind: "NFS"
    server: string
    path: string
}

export type Pv_Backend = Pv_Backend_HostPath | Pv_Backend_Local | Pv_Backend_NFS
export interface Pv_Props<Mode extends PvVolumeMode = PvVolumeMode>
    extends Resource_Props_Top<K8S.PersistentVolumeSpec> {
    $accessModes: PvAccessMode_Many
    $storageClass?: ResourceRef<storage.v1.StorageClass._>
    $mode?: Mode
    $reclaimPolicy?: Pv_ReclaimMode
    $capacity: {
        storage: Units.Data
    }
    $backend?: Pv_Backend
    mountOptions?: string[]
    nodeAffinity?: K8S.VolumeNodeAffinity
}
export type Pv_ReclaimMode = "Retain" | "Delete" | "Recycle"
export type Pv_Ref<Mode extends PvVolumeMode = PvVolumeMode> =
    ResourceRef<v1.PersistentVolume._> & {
        __MODE__: Mode
    }

export class Pv<
    Mode extends PvVolumeMode = "Filesystem",
    Name extends string = string
> extends K8sResource<Name, Pv_Props<Mode>> {
    __MODE__!: Mode
    get kind() {
        return v1.PersistentVolume._
    }

    protected __needs__() {
        return {
            storageClass: this.props.$storageClass
        }
    }
    protected __body__(): K8S.KubePersistentVolumeProps {
        const self = this
        const accessModes = parsePvAccessMode(self.props.$accessModes)
        // Make sure it parses correctly
        Units.Data.parse(self.props.$capacity.storage)
        if (self.props.$backend?.kind === "Local") {
            if (!self.props.nodeAffinity) {
                throw new K8tsResourceError(
                    `While manifesting ${self.__vertex__.format("source")}, PV with Local backend must have nodeAffinity.`
                )
            }
        }
        if (!self.props.$backend && !self.props.$storageClass) {
            throw new K8tsResourceError(
                `While manifesting ${self.__vertex__.format("source")}, PV that doesn't have a $backend must have a $storageClass.`
            )
        }
        let spec: K8S.PersistentVolumeSpec = {
            accessModes,
            storageClassName: self.props.$storageClass?.ident.name ?? "standard",
            capacity: toCdkQuantityRecord(self.props.$capacity),
            volumeMode: self.props.$mode ?? "Filesystem",
            mountOptions: self.props.mountOptions,
            persistentVolumeReclaimPolicy: self.props.$reclaimPolicy ?? "Retain",
            nodeAffinity: self.props.nodeAffinity
        }
        spec = {
            ...spec,
            ...parseBackend(self.props.$backend)
        }
        spec = merge(spec, self.props.$$manifest)
        return {
            spec
        }
    }
}
