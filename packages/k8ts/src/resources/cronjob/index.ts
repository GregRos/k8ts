import { CDK } from "@k8ts/imports"
import { Cron, CronStanza, manifest, Origin, relations } from "@k8ts/instruments"
import { Timezone } from "@k8ts/instruments/src/timezone"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { omit, omitBy } from "lodash"
import { k8ts } from "../../kind-map"
import { api_ } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
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

@k8ts(api_.batch_.v1_.CronJob)
@equiv_cdk8s(CDK.KubeCronJob)
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
    kind = api_.batch_.v1_.CronJob
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
