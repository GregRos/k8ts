import { FutureExports, LiveRefable, ManifestResource, Producer } from "@k8ts/instruments"
import { seq, type Seq } from "doddle"
import type { FileOrigin } from "./origin"

export namespace FileExports {
    export type Producer<Produced extends object> = Producer.Producer<void, Produced>
    export interface Props<
        Scope extends FileOrigin.Scope = FileOrigin.Scope,
        Produced extends LiveRefable = LiveRefable
    > {
        origin: FileOrigin<Scope>
        FILE: Producer<Produced>
    }

    export class Core {
        #props: Props
        #produced: Seq<LiveRefable>
        constructor(props: Props) {
            this.#props = props

            this.#produced = seq(() => props.FILE())
                .as<ManifestResource>()
                .each(x => {
                    x.meta.add("k8ts.org/", {
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
