import { Cron, CronStanza, Resource_Top, type Resource_Entity } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { CDK } from "@k8ts/sample-interfaces"
import { doddle } from "doddle"
import { omitBy } from "lodash"
import { Timezone } from "../../../../instruments/dist/expressions/timezone"
import { batch } from "../../kinds/batch"
import { Pod_Template, type Pod_Props } from "../pod"
export interface CronJob_Props<CronSpec extends Cron.Record>
    extends Omit<CDK.CronJobSpec, "jobTemplate" | "schedule" | "timeZone"> {
    $schedule: CronStanza<CronSpec>
    $template: Pod_Props<never> & {
        restartPolicy: "Always" | "OnFailure" | "Never"
    }
    $meta?: Meta.Input
    timeZone: Timezone
}

export class CronJob<
    Name extends string = string,
    Cron extends Cron.Record = Cron.Record
> extends Resource_Top<Name, CronJob_Props<Cron>> {
    get kind() {
        return batch.v1.CronJob._
    }
    private _template = doddle(() => {
        return new Pod_Template<never>(this, this.name, this.props.$template)
    })

    protected __kids__(): Resource_Entity[] {
        return [this._template.pull()]
    }

    protected body(): CDK.KubeCronJobProps {
        const self = this
        const template = self._template.pull()["__submanifest__"]()
        return {
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
    }
}
