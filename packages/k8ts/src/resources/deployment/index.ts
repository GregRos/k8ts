import { CDK } from "@imports"
import { Base } from "../../node/base"
import { K8tsResources } from "../kind-map"
import type { PodTemplate } from "../pod/template"

export type DeploymentProps<Ports extends string> = Omit<
    CDK.DeploymentSpec,
    "selector" | "template"
> & {
    template: PodTemplate
}
@K8tsResources.register("Deployment")
export class Deployment<Ports extends string = string> extends Base<DeploymentProps<Ports>> {
    kind = "Deployment" as const
    manifest(): CDK.KubeDeploymentProps {
        return {
            metadata: this.meta.expand(),
            spec: {
                ...this.props,
                selector: {
                    matchLabels: {
                        app: this.name
                    }
                },
                template: this.props.template.setMeta(m => m.add("%app", this.name)).manifest()
            }
        }
    }
}
