import {
    Cron_Stanza,
    ResourceTop,
    type Cron_Record,
    type Resource_Props,
    type ResourceRef
} from "@k8ts/instruments"
import { type Metadata_Input } from "@k8ts/metadata"
import { CDK } from "@k8ts/sample-interfaces"
import { doddlify } from "doddle"
import { merge, omitBy } from "lodash"
import { Timezone } from "../../../../instruments/dist/expressions/timezone"
import { batch } from "../../resource-idents/batch"
import { PodTemplate, type PodProps } from "../pod"
export interface CronJob_Props<CronSpec extends Cron_Record>
    extends Resource_Props<CDK.KubeCronJobProps> {
    $schedule: Cron_Stanza<CronSpec>
    $template: PodProps<never> & {
        restartPolicy: "Always" | "OnFailure" | "Never"
    }
    $meta?: Metadata_Input
    timeZone: Timezone
}

export class CronJob<
    Name extends string = string,
    Cron extends Cron_Record = Cron_Record
> extends ResourceTop<Name, CronJob_Props<Cron>> {
    get ident() {
        return batch.v1.CronJob._
    }

    @doddlify
    get template() {
        return new PodTemplate<never>(this, this.name, this.props.$template)
    }

    protected __kids__(): Iterable<ResourceRef> {
        this.template
        return super.__kids__()
    }

    protected __body__(): CDK.KubeCronJobProps {
        const self = this
        const template = self.template["__submanifest__"]()
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
