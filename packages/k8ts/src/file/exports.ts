import { FutureExports, LiveRefable, Producer } from "@k8ts/instruments"
import { seq, type Seq } from "doddle"
import { ManifestResource } from "../node"
import { k8ts_namespace } from "../runner/exporter/meta"
import { Factory } from "./factory"
import type { FileOrigin } from "./origin"

export namespace FileExports {
    export type Producer<
        Scope extends FileOrigin.Scope,
        Produced extends object
    > = Producer.Producer<Factory.FromScope<Scope>, Produced>
    export interface Props<
        Scope extends FileOrigin.Scope = FileOrigin.Scope,
        Produced extends LiveRefable = LiveRefable
    > {
        origin: FileOrigin<Scope>
        FILE: Producer<Scope, Produced>
    }

    export class Core {
        #props: Props
        #produced: Seq<LiveRefable>
        constructor(props: Props) {
            this.#props = props
            const producer = Producer.map(props.FILE, () => {
                if (props.origin.scope === "cluster") {
                    return new Factory.Cluster(props.origin.node)
                } else {
                    return new Factory.Namespaced(props.origin.node)
                }
            })
            this.#produced = seq(() => producer(props.origin))
                .as<ManifestResource>()
                .each(x => {
                    x.meta.add(k8ts_namespace, {
                        "#is-exported": "true"
                    })
                })
                .cache()
        }

        get __entity__() {
            return this.#props.origin
        }

        get __node__() {
            return this.#props.origin.node
        }

        [Symbol.iterator]() {
            return this.#produced[Symbol.iterator]()
        }
    }

    export function make<Scope extends FileOrigin.Scope, Produced extends LiveRefable>(
        props: Props<Scope, Produced>
    ): Core & FutureExports<Produced> {
        const core = new Core(props as any)
        return FutureExports.make({
            actual: core,
            origin: props.origin.node,
            exports: core
        }) as any
    }
}
