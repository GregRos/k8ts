import {
    ResourceRef,
    ResourceTop,
    TemplateOrigin,
    type Resource_Props_Top
} from "@k8ts/instruments"
import { CDK } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { merge, omit } from "lodash"
import { apps } from "../../../gvks/apps"
import { K8tsResourceError } from "../../errors"
import { Pod, type Pod_Props } from "../pod/pod"
import { createSelectionMetadata } from "../util"
import type { Workload_Ref } from "../workload-ref"

export interface DaemonSet_UpdateStrategy_RollingUpdate extends CDK.RollingUpdateDaemonSet {
    type: "RollingUpdate"
}
export interface DaemonSet_UpdateStrategy_OnDelete {
    type: "OnDelete"
}
export type DaemonSet_UpdateStrategy =
    | DaemonSet_UpdateStrategy_RollingUpdate
    | DaemonSet_UpdateStrategy_OnDelete

export interface DaemonSet_Props<Ports extends string>
    extends Resource_Props_Top<CDK.DaemonSetSpec> {
    $template: Pod_Props<Ports>
    $updateStrategy?: DaemonSet_UpdateStrategy
}

export class DaemonSet<Name extends string, Ports extends string = string>
    extends ResourceTop<Name, DaemonSet_Props<Ports>>
    implements Workload_Ref<Ports>
{
    private _template = new TemplateOrigin("DaemonSetTemplate", {
        owner: this
    })
    get kind() {
        return apps.v1.DaemonSet._
    }

    get selectorLabels() {
        return createSelectionMetadata(this.ident.name)
    }

    protected __kids__(): Iterable<ResourceRef> {
        return [this.Template]
    }

    protected async __body__(): Promise<CDK.KubeDaemonSetProps> {
        const self = this
        const template = await self.Template["__manifest__"]()
        const noKindFields = omit(template, ["kind", "apiVersion"])
        const spec = {
            selector: {
                matchLabels: this.selectorLabels.labels
            },
            template: noKindFields,
            updateStrategy: self._updateStrategy
        } satisfies CDK.DaemonSetSpec
        const spec2 = merge(spec, self.props.$overrides)
        return {
            spec: spec2
        }
    }

    private get _updateStrategy() {
        const strategy = this.props.$updateStrategy
        if (!strategy) {
            return undefined
        }
        if (strategy.type === "OnDelete") {
            return { type: "OnDelete" }
        }
        if (strategy.type === "RollingUpdate") {
            return {
                type: "RollingUpdate",
                rollingUpdate: omit(strategy, "type")
            }
        }
        throw new K8tsResourceError(`Invalid update strategy type: ${strategy}`)
    }

    @doddlify
    get Template() {
        const self = this
        const resource = this._template.attach(() => {
            return new Pod(`${self.ident.name}`, self.props.$template, {
                scopedOrigin: self.__origin__
            })
        })

        return resource
    }

    get ports() {
        return this.Template.ports
    }
}
