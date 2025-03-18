import { FutureExports, Producer } from "@k8ts/instruments"
import { seq, type Seq } from "doddle"
import { k8tsSectionMeta } from "../meta/k8ts-section"
import type { ManifestResource } from "../node"
import { Factory } from "./factory"
import type { FileOrigin } from "./origin"

export namespace FileExports {
    export type Producer<
        Scope extends FileOrigin.Scope,
        Produced extends object
    > = Producer.Producer<Factory.FromScope<Scope>, Produced>
    export interface Props<
        Scope extends FileOrigin.Scope = FileOrigin.Scope,
        Produced extends ManifestResource = ManifestResource
    > {
        origin: FileOrigin<Scope>
        FILE: Producer<Scope, Produced>
    }

    export class Core {
        #props: Props
        #produced: Seq<ManifestResource>
        constructor(props: Props) {
            this.#props = props
            const producer = Producer.map(props.FILE, () => {
                if (props.origin.scope === "cluster") {
                    return new Factory.Cluster(props.origin.node)
                } else {
                    return new Factory.Namespaced(props.origin.node)
                }
            })
            this.#produced = seq(() => producer(props.origin)).each(x => {
                x.meta.add(
                    k8tsSectionMeta({
                        "^is-exported": "true"
                    })
                )
            })
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

    export function make<Scope extends FileOrigin.Scope, Produced extends ManifestResource>(
        props: Props<Scope, Produced>
    ): Core & FutureExports<Produced> {
        const core = new Core(props)
        return FutureExports.make({
            actual: core,
            origin: props.origin.node,
            exports: core
        }) as any
    }
}
