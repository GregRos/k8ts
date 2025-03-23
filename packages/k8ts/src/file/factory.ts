import {
    Origin,
    Trace,
    TraceEmbedder,
    auto_register,
    displayers,
    type LiveRefable
} from "@k8ts/instruments"
import chalk from "chalk"
import StackTracey from "stacktracey"
import {
    ConfigMap,
    DataMode,
    Deployment,
    HttpRoute,
    Namespace,
    PodTemplate,
    Pv,
    Pvc,
    Secret,
    Service
} from "../resources"
import { AssemblyStage } from "../runner/exporter"
import type { FileOrigin } from "./origin"

export type Factory = Factory.Factory
export namespace Factory {
    export type Factory = Cluster | Namespaced
    export type FromScope<FScope extends FileOrigin.Scope> = FScope extends "cluster"
        ? Cluster
        : Namespaced

    export class Base {
        constructor(readonly origin: Origin) {}

        protected _metaWithName(name: string) {
            return this.origin.meta.add({
                name
            })
        }
    }
    @auto_register
    export class Cluster extends Base {
        PersistentVolume<Name extends string, Mode extends DataMode = "Filesystem">(
            name: Name,
            props: Pv.Props<Mode>
        ) {
            return new Pv.Pv(this.origin, this._metaWithName(name), props) as LiveRefable<
                Pv.Pv<Mode>,
                Name
            >
        }
        Namespace<Name extends string>(name: Name, props?: Namespace.Props) {
            return new Namespace.Namespace(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<Namespace, Name>
        }
    }

    @auto_register
    export class Namespaced extends Base {
        Claim<Mode extends DataMode, Name extends string>(name: Name, mode: Pvc.Props<Mode>) {
            return new Pvc.Pvc(this.origin, this._metaWithName(name), mode) as LiveRefable<
                Pvc.Pvc<Mode>,
                Name
            >
        }
        ConfigMap<Name extends string>(name: Name, props: ConfigMap.Props) {
            return new ConfigMap.ConfigMap(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<ConfigMap, Name>
        }
        HttpRoute<Name extends string, Ports extends string>(
            name: Name,
            props: HttpRoute.Props<Ports>
        ) {
            return new HttpRoute.HttpRoute(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<HttpRoute<Ports>, Name>
        }
        Secret<Name extends string>(name: Name, props: Secret.Props) {
            return new Secret.Secret(this.origin, this._metaWithName(name), props) as LiveRefable<
                Secret,
                Name
            >
        }
        Service<Name extends string, DeployPorts extends string, ExposedPorts extends DeployPorts>(
            name: Name,
            props: Service.Props<DeployPorts, ExposedPorts>
        ) {
            return new Service.Service(this.origin, this._metaWithName(name), props) as LiveRefable<
                Service<ExposedPorts>,
                Name
            >
        }

        Deployment<Name extends string>(name: Name, props: Deployment.NormalProps) {
            const builder = this
            const traceHere = new Trace(new StackTracey().slice(2))

            return {
                Template(templateProps?: PodTemplate.PodProps) {
                    return {
                        POD<Ports extends string>(
                            producer: PodTemplate.PodContainerProducer<Ports>
                        ) {
                            const dep = new Deployment.Deployment(
                                builder.origin,
                                builder._metaWithName(name),
                                {
                                    ...props,
                                    template: {
                                        ...templateProps,
                                        POD: producer
                                    }
                                }
                            ) as LiveRefable<Deployment<Ports>, Name>
                            TraceEmbedder.set(dep.node, traceHere)
                            dep.node.origin["__attach_resource__"]([dep.node])
                            return dep
                        }
                    }
                }
            }
        }

        DomainRoute<Name extends string, Ports extends string>(
            name: Name,
            props: HttpRoute.Props<Ports>
        ) {
            return new HttpRoute.HttpRoute(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<HttpRoute<Ports>, Name>
        }
        PodTemplate<Name extends string, Ports extends string>(
            name: Name,
            props: PodTemplate.Props<Ports> | PodTemplate.Props<Ports>["POD"]
        ) {
            const props_ = typeof props === "function" ? { POD: props } : props
            return new PodTemplate.PodTemplate(
                this.origin,
                this._metaWithName(name),
                props_
            ) as LiveRefable<PodTemplate<Ports>, Name>
        }
    }
}
@displayers({
    simple: s => s.text,
    pretty: stage => chalk.bgGreenBright.bold.black(` ${stage.text} `)
})
export class Stage {
    text: string
    constructor(private stage: AssemblyStage) {
        this.text = `${stage.toUpperCase()}`
    }

    private get _emoji() {
        switch (this.stage) {
            case "gathering":
                return "🛒"
            case "loading":
                return "🚚"
            case "manifesting":
                return "👻"
            case "start":
                return "🚀"
            case "saving":
                return "💾"
            case "serializing":
                return "🖨️"
            case "done":
                return "✅"
        }
    }
}
