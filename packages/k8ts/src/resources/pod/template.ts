import { CDK } from "@imports"
import { Base } from "../../graph/base"
import type { Container } from "./container/container"
import { PodScope } from "./scope"
export type PodTemplateProps<Ports extends string> = Omit<
    CDK.PodSpec,
    "containers" | "initContainers" | "volumes"
> & {
    scope(scope: PodScope): Iterable<Container<Ports>>
}

export class PodTemplate<Ports extends string = string> extends Base<PodTemplateProps<Ports>> {
    kind = "Pod" as const

    manifest(): CDK.PodTemplateSpec {
        const { meta, props } = this
        const containers = [...props.scope(new PodScope())]
        const initContainers = containers.filter(c => c.subtype === "init").map(x => x.manifest())
        const mainContainers = containers.filter(c => c.subtype === "main").map(x => x.manifest())
        const volumes = containers
            .flatMap(x => Object.values(x.props.mounts ?? {}))
            .map(x => x.parent)
            .map(x => x.manifest())
        return {
            metadata: meta.expand(),
            spec: {
                ...props,
                containers: mainContainers,
                initContainers,
                volumes
            }
        }
    }
}
