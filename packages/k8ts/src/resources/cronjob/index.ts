import { Cron, CronStanza, manifest, Origin, relations } from "@k8ts/instruments"
import { Timezone } from "@k8ts/instruments/src/timezone"
import { Meta, MutableMeta } from "@k8ts/metadata"
import { omit, omitBy } from "lodash"
import { CDK } from "../../_imports"
import { k8ts } from "../../kind-map"
import { api } from "../../kinds"
import { equiv_cdk8s } from "../../node/equiv-cdk8s"
import { ManifestResource } from "../../node/manifest-resource"
import { PodTemplate } from "../pod/pod-template"
export interface K8tsCronJobProps<CronSpec extends Cron.Record>
    extends Omit<CDK.CronJobSpec, "jobTemplate" | "schedule" | "timeZone"> {
    $schedule: CronStanza<CronSpec>
    $template: PodTemplate.Props<never>
    $meta?: Meta.Input
    timeZone: Timezone
}

@k8ts(api.batch_.v1_.CronJob)
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
                jobTemplate: noKindFields,
                timeZone: self.props.timeZone
            }
        }
    }
})
export class K8tsCronJob<Cron extends Cron.Record> extends ManifestResource<
    K8tsCronJobProps<Cron>
> {
    kind = api.batch_.v1_.CronJob
    template: PodTemplate.PodTemplate<never>
    constructor(origin: Origin, meta: Meta | MutableMeta, props: K8tsCronJobProps<Cron>) {
        super(origin, meta, props)
        this.template = new PodTemplate.PodTemplate(
            origin,
            Meta.make({
                name: this.name
            }),
            props.$template
        )
        this.template.meta.add(props.$meta)
    }
}
