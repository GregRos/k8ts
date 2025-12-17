import { CDK } from "@k8ts/imports"
import { Cron, CronStanza, manifest, ManifestResource, Origin, relations } from "@k8ts/instruments"
import { Timezone } from "@k8ts/instruments/timezone"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { omit, omitBy } from "lodash"
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

@relations({
    kids: s => [s.template]
})
@manifest({
    async body(self): Promise<CDK.KubeCronJobProps> {
        const template = await self.template["manifest"]()
        const noKindFields = omit(template, ["kind", "apiVersion"])
        return {
            spec: {
                ...omitBy(self.props, (x, k) => k.startsWith("$")),
                schedule: self.props.$schedule.string,
                jobTemplate: {
                    spec: {
                        template: noKindFields
                    }
                },
                timeZone: self.props.timeZone
            }
        }
    }
})
export class CronJob<Cron extends Cron.Record> extends ManifestResource<CronJob_Props<Cron>> {
    kind = batch.v1.CronJob._
    template: PodTemplate.Pod_Template<never>
    constructor(origin: Origin, meta: Meta | MutableMeta, props: CronJob_Props<Cron>) {
        super(origin, meta, props)
        this.template = new PodTemplate.Pod_Template(
            origin,
            Meta.make({
                name: this.name
            }),
            props.$template
        )
        this.template.meta.add(props.$meta)
    }
}
