import { CDK } from "@imports"
import { apps_v1 } from "../../api-versions"
import { ManifestResource } from "../../node/manifest-resource"
import { K8tsResources } from "../kind-map"
import type { PodTemplate } from "../pod/pod-template"

export type Deployment<Ports extends string> = Deployment.Deployment<Ports>
export namespace Deployment {
    export type Props<Ports extends string> = Omit<CDK.DeploymentSpec, "selector" | "template"> & {
        template: PodTemplate<Ports>
    }

    @K8tsResources.register("Deployment")
    export class Deployment<Ports extends string = string> extends ManifestResource<Props<Ports>> {
        api = apps_v1.kind("Deployment")
        get ports() {
            return this.props.template.ports
        }
        manifest(): CDK.KubeDeploymentProps {
            this.props.template.meta.add("%app", this.name)
            return {
                metadata: this.metadata(),
                spec: {
                    ...this.props,
                    selector: {
                        matchLabels: {
                            app: this.name
                        }
                    },
                    template: this.props.template.manifest()
                }
            }
        }
    }
}
