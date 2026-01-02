import { ResourceRef, ResourceTop, type Unit } from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { MakeError } from "../../../error"
import type { HostPathType } from "../../hostpath"
import { v1 } from "../../idents/default"
import { storage } from "../../idents/storage"
import { parsePvAccessMode, type PvAccessModes } from "../access-mode"
import type { PvMode } from "../block-mode"
import { parseBackend } from "./parse-backend"

const StorageClassKind = storage.v1.StorageClass._

export interface PvBackendHostPath {
    kind: "HostPath"
    hostpathType: HostPathType
    path: string
}
export interface PvBackendLocal {
    kind: "Local"
    path: string
}
export interface PvBackendNfs {
    kind: "NFS"
    server: string
    path: string
}

export type PvBackend = PvBackendHostPath | PvBackendLocal | PvBackendNfs
export interface PvPropsK8ts<Mode extends PvMode = PvMode> {
    $accessModes: PvAccessModes
    $storageClass?: ResourceRef<storage.v1.StorageClass._>
    $mode?: Mode
    reclaimPolicy?: Reclaim
    $capacity: Unit.Data
    $backend?: PvBackend
    mountOptions?: string[]
    nodeAffinity?: CDK.VolumeNodeAffinity
}
export type Reclaim = "Retain" | "Delete" | "Recycle"
export type PvRef<Mode extends PvMode = PvMode> = ResourceRef<v1.PersistentVolume._> & {
    __MODE__: Mode
}

export class Pv<
    Mode extends PvMode = "Filesystem",
    Name extends string = string
> extends ResourceTop<Name, PvPropsK8ts<Mode>> {
    __MODE__!: Mode
    get ident() {
        return v1.PersistentVolume._
    }

    protected __needs__() {
        return {
            storageClass: this.props.$storageClass
        }
    }
    protected body() {
        const self = this
        const pvProps = self.props
        const accessModes = parsePvAccessMode(pvProps.$accessModes)
        if (self.props.$backend?.kind === "Local") {
            if (!pvProps.nodeAffinity) {
                throw new MakeError(
                    `While manifesting ${self.node.format("source")}, PV with Local backend must have nodeAffinity.`
                )
            }
        }
        if (!self.props.$backend && !self.props.$storageClass) {
            throw new MakeError(
                `While manifesting ${self.node.format("source")}, PV that doesn't have a $backend must have a $storageClass.`
            )
        }
        let base: CDK.PersistentVolumeSpec = {
            accessModes,
            storageClassName: pvProps.$storageClass?.name ?? "standard",
            capacity: pvProps.$capacity
                ? {
                      storage: CDK.Quantity.fromString(pvProps.$capacity)
                  }
                : undefined,
            volumeMode: pvProps.$mode ?? "Filesystem",
            mountOptions: pvProps.mountOptions,
            persistentVolumeReclaimPolicy: pvProps.reclaimPolicy ?? "Retain",
            nodeAffinity: pvProps.nodeAffinity
        }
        base = {
            ...base,
            ...parseBackend(pvProps.$backend)
        }
        return {
            spec: base
        }
    }
}
