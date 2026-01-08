import {
    Cron_Stanza,
    ResourceTop,
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
export interface CronJob_Props<CronSpec extends Cron_Record>
    extends Resource_Props_Top<CDK.KubeCronJobProps> {
    $schedule: Cron_Stanza<CronSpec>
    $template: Pod_Props<never> & {
        restartPolicy: "Always" | "OnFailure" | "Never"
    }
    $metadata?: Metadata_Input
    timeZone: Timezone
}

export class CronJob<
    Name extends string = string,
    Cron extends Cron_Record = Cron_Record
> extends ResourceTop<Name, CronJob_Props<Cron>> {
    private _template = new TemplateOrigin("CronJobTemplate", {
        owner: this
    })
    get kind() {
        return batch.v1.CronJob._
    }

    @doddlify
    get PodTemplate() {
        const self = this
        const boundTemplate = this.__scope__(this.props.$template.Containers)
        const resource = this._template.attach(() => {
            return new Pod(`${self.ident.name}`, {
                ...self.props.$template,
                Containers: boundTemplate
            })
        })

        return resource
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
