import { ChildOrigin, DynamicExports, type Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { seq, type Seq } from "doddle"
import type { Base } from "../node"
import type { Namespace } from "../resources"
import { Factory as Factory_ } from "./factory"
export type File<T extends Base> = File.File<T>
export namespace File {
    export import Factory = Factory_
    export interface Props<T extends Base = Base, Factory = any> {
        readonly filename: string
        FILE(factory: Factory): Iterable<T>
    }
    export namespace Props {
        export type Cluster<T extends Base> = Props<T, Factory.Cluster> & {
            scope: "cluster"
        }
        export type Namespaced<T extends Base> = Props<T, Factory.Namespaced> & {
            scope: Namespace
        }
    }
    export type File<T extends Base = Base> = DynamicExports<T> &
        Iterable<T> & {
            props: Props<T>
        }

    type InnerProps<T extends Base> = Props<T, Meta>
    class _K8tsFile<T extends Base> extends ChildOrigin {
        readonly nodes: Seq<T>
        constructor(
            parent: Origin,
            readonly props: InnerProps<T>
        ) {
            super(props.filename, Meta.make(), parent)
            this.nodes = seq(() => {
                return props.FILE(this.meta)
            }).cache()
        }

        [Symbol.iterator]() {
            return this.nodes[Symbol.iterator]()
        }

        get origin() {
            return this
        }
    }

    export function make<T extends Base>(parent: Origin, props: InnerProps<T>): File<T> {
        const file = new _K8tsFile(parent, props)
        const exports = DynamicExports.make({
            actual: file,
            origin: file,
            exports: file.nodes
        })

        return exports as any
    }
}
