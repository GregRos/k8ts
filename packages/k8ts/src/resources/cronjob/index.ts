import { CDK } from "@k8ts/imports"
import { Cron, CronStanza, ManifestResource, type ResourceEntity } from "@k8ts/instruments"
import { Timezone } from "@k8ts/instruments/timezone"
import { Meta } from "@k8ts/metadata"
import { doddle } from "doddle"
import { omitBy } from "lodash"
import { batch } from "../../kinds/batch"
import { PodTemplate } from "../pod/pod-template"
export interface CronJob_Props<CronSpec extends Cron.Record>
    extends Omit<CDK.CronJobSpec, "jobTemplate" | "schedule" | "timeZone"> {
    $schedule: CronStanza<CronSpec>
    $template: PodTemplate.Pod_Props<never> & {
        restartPolicy: "Always" | "OnFailure" | "Never"
    }
    $meta?: Meta.Input
    timeZone: Timezone
}

export class CronJob<Cron extends Cron.Record> extends ManifestResource<CronJob_Props<Cron>> {
    get kind() {
        return batch.v1.CronJob._
    }
    private _template = doddle(() => {
        return new PodTemplate.Pod_Template<never>(this, this.name, this.props.$template)
    })

    protected __kids__(): ResourceEntity[] {
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
