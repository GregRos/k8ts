import {
    CronStanza,
    K8sResource,
    TemplateOrigin,
    type Cron_Record,
    type Resource_Props_Top,
    type ResourceRef,
    type Timezone
} from "@k8ts/instruments"
import { type Metadata_Input } from "@k8ts/metadata"
import { CDK } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { merge, omitBy } from "lodash"
import { batch } from "../../../gvks/batch"
import { Pod, Pod_Props } from "../pod/pod"
import { createSelectionMetadata } from "../util"
export interface CronJob_Props<CronSpec extends Cron_Record>
    extends Resource_Props_Top<CDK.KubeCronJobProps> {
    $schedule: CronStanza<CronSpec>
    $template: Pod_Props<never> & {
        restartPolicy: "Always" | "OnFailure" | "Never"
    }
    $metadata?: Metadata_Input
    timeZone: Timezone
}

export class CronJob<
    Name extends string = string,
    Cron extends Cron_Record = Cron_Record
> extends K8sResource<Name, CronJob_Props<Cron>> {
    private _template = new TemplateOrigin("CronJobTemplate", {
        owner: this
    })
    get kind() {
        return batch.v1.CronJob._
    }
    get selectorLabels() {
        return createSelectionMetadata(this)
    }
    @doddlify
    get PodTemplate() {
        const p = new Pod(this.ident.name, this.props.$template, {
            origins: {
                own: this._template,
                subscope: this.__origin__
            },
            metadata: this.selectorLabels
        })
        return p
    }

    protected __kids__(): Iterable<ResourceRef> {
        this.PodTemplate
        return super.__kids__()
    }

    protected async __body__(): Promise<CDK.KubeCronJobProps> {
        const self = this
        const template = await self.PodTemplate["__manifest__"]()
        const object = {
            spec: {
                ...omitBy(self.props, (x, k) => k.startsWith("$") || k === "timeZone"),
                schedule: self.props.$schedule.toString(),
                timeZone: self.props.timeZone,
                jobTemplate: {
                    spec: {
                        template: template
                    }
                }
            }
        }
        return merge(object, self.props.$overrides)
    }
}
