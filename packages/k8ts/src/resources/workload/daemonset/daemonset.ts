import { K8sResource, ResourceRef, TemplateOrigin } from "@k8ts/instruments"
import { K8S } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { merge, omit } from "lodash"
import { apps } from "../../../gvks/apps"
import { K8tsResourceError } from "../../errors"
import { Pod } from "../pod/pod"
import { createSelectionMetadata } from "../util"
import type { Workload_Ref } from "../workload-ref"
import type { DaemonSet_Props } from "./props"

export class DaemonSet<Name extends string, Ports extends string = string>
    extends K8sResource<Name, DaemonSet_Props<Ports>>
    implements Workload_Ref<Ports>
{
    private _template = new TemplateOrigin("DaemonSetTemplate", {
        owner: this
    })
    get kind() {
        return apps.v1.DaemonSet._
    }

    get selectorLabels() {
        return createSelectionMetadata(this)
    }

    protected __kids__(): Iterable<ResourceRef> {
        return [this.PodTemplate]
    }

    protected async __body__(): Promise<K8S.KubeDaemonSetProps> {
        const self = this
        const template = await self.PodTemplate["__manifest__"]()
        const noKindFields = omit(template, ["kind", "apiVersion"])
        const spec = {
            selector: {
                matchLabels: this.selectorLabels.labels
            },
            template: noKindFields,
            updateStrategy: self._updateStrategy
        } satisfies K8S.DaemonSetSpec
        const spec2 = merge(spec, self.props.$$manifest)
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
    get PodTemplate() {
        const self = this
        const resource = new Pod(`${self.ident.name}`, self.props.$template, {
            origins: {
                subscope: self.__origin__,
                own: self._template
            },
            metadata: this.selectorLabels
        })

        return resource
    }

    get ports() {
        return this.PodTemplate.ports
    }
}
