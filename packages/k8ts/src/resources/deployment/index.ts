import { CDK } from "@imports"
import { Depends } from "../../graph/base"
import type { PodTemplate } from "../pod/template"

export type DeploymentProps = Omit<CDK.DeploymentSpec, "selector" | "template">
export class Deployment<Ports extends string> extends Depends<DeploymentProps, PodTemplate<Ports>> {
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
                template: this.dependency.setMeta(m => m.add("%app", this.name)).manifest()
            }
        }
    }
}
