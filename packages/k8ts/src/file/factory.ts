import {
    Cron,
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
    Deployment,
    HttpRoute,
    Namespace,
    PodTemplate,
    Pv,
    Pv_VolumeMode,
    Pvc,
    Secret,
    Service,
    ServiceAccount
} from "../resources"
import { CronJob, CronJob_Props } from "../resources/cronjob"
import { ClusterRole } from "../resources/rbac/cluster-role"
import { ClusterRoleBinding } from "../resources/rbac/cluster-role-binding"
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
            return this.origin.meta.clone().add({
                name
            })
        }
    }
    @auto_register
    export class Cluster extends Base {
        ClusterRole<Name extends string>(name: Name, props: ClusterRole.ClusterRole_Props) {
            return new ClusterRole.ClusterRole(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<ClusterRole.ClusterRole, Name>
        }
        ClusterRoleBinding<Name extends string>(
            name: Name,
            props: ClusterRoleBinding.ClusterRoleBoding_Props
        ) {
            return new ClusterRoleBinding.ClusterRoleBinding(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<ClusterRoleBinding.ClusterRoleBinding, Name>
        }
        PersistentVolume<Name extends string, Mode extends Pv_VolumeMode = "Filesystem">(
            name: Name,
            props: Pv.Pv_Props_K8ts<Mode>
        ) {
            return new Pv.Pv(this.origin, this._metaWithName(name), props) as LiveRefable<
                Pv.Pv<Mode>,
                Name
            >
        }
        Namespace<Name extends string>(name: Name, props?: Namespace.Namespace_Props) {
            return new Namespace.Namespace(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<Namespace, Name>
        }
    }

    @auto_register
    export class Namespaced extends Base {
        Claim<Name extends string, Mode extends Pv_VolumeMode = "Filesystem">(
            name: Name,
            mode: Pvc.Pvc_Props<Mode>
        ) {
            return new Pvc.Pvc(this.origin, this._metaWithName(name), mode) as LiveRefable<
                Pvc.Pvc<Mode>,
                Name
            >
        }
        CronJob<Name extends string, Cr extends Cron.Record>(name: Name, props: CronJob_Props<Cr>) {
            return new CronJob(this.origin, this._metaWithName(name), props) as LiveRefable<
                CronJob<Cr>,
                Name
            >
        }

        ConfigMap<Name extends string>(name: Name, props: ConfigMap.ConfigMap_Props) {
            return new ConfigMap.ConfigMap(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<ConfigMap, Name>
        }
        HttpRoute<Name extends string, Ports extends string>(
            name: Name,
            props: HttpRoute.HttpRoute_Props<Ports>
        ) {
            return new HttpRoute.HttpRoute(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<HttpRoute<Ports>, Name>
        }
        Secret<Name extends string>(name: Name, props: Secret.Secret_Props) {
            return new Secret.Secret(this.origin, this._metaWithName(name), props) as LiveRefable<
                Secret,
                Name
            >
        }
        ServiceAccount<Name extends string>(
            name: Name,
            props?: ServiceAccount.ServiceAccount_Props
        ) {
            return new ServiceAccount.ServiceAccount(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<ServiceAccount, Name>
        }
        Service<Name extends string, DeployPorts extends string, ExposedPorts extends DeployPorts>(
            name: Name,
            props: Service.Service_Props<DeployPorts, ExposedPorts>
        ) {
            return new Service.Service(this.origin, this._metaWithName(name), props) as LiveRefable<
                Service<ExposedPorts>,
                Name
            >
        }

        Deployment<Name extends string>(name: Name, props: Deployment.Deployment_Props_Original) {
            const builder = this
            const traceHere = new Trace(new StackTracey().slice(2))

            return {
                Template(templateProps?: PodTemplate.Pod_Props_Original) {
                    return {
                        POD<Ports extends string>(
                            producer: PodTemplate.Pod_Container_Producer<Ports>
                        ) {
                            const dep = new Deployment.Deployment(
                                builder.origin,
                                builder._metaWithName(name),
                                {
                                    ...props,
                                    $template: {
                                        ...templateProps,
                                        $POD: producer
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
            props: HttpRoute.HttpRoute_Props<Ports>
        ) {
            return new HttpRoute.HttpRoute(
                this.origin,
                this._metaWithName(name),
                props
            ) as LiveRefable<HttpRoute<Ports>, Name>
        }
        PodTemplate<Name extends string, Ports extends string>(
            name: Name,
            props: PodTemplate.Pod_Props<Ports> | PodTemplate.Pod_Props<Ports>["$POD"]
        ) {
            const props_ = typeof props === "function" ? { $POD: props } : props
            return new PodTemplate.Pod_Template(
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
