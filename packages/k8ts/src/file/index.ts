import { ChildOrigin, Exports, type Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { seq, type Seq } from "doddle"
import type { Base } from "../node/base"

export interface K8tsFileProps<T extends Base = Base, Factory = any> {
    readonly filename: string
    FILE(factory: Factory): Iterable<T>
}
export type K8tsFile<T extends Base = Base> = Exports<T> &
    Iterable<T> & {
        props: K8tsFileProps<T>
    }

export type K8tsInnerFileProps<T extends Base> = K8tsFileProps<T, Meta>
class _K8tsFile<T extends Base> extends ChildOrigin {
    readonly nodes: Seq<T>
    constructor(
        parent: Origin,
        readonly props: K8tsInnerFileProps<T>
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

export function File<T extends Base>(parent: Origin, props: K8tsInnerFileProps<T>): K8tsFile<T> {
    const file = new _K8tsFile(parent, props)
    const exports = Exports.make(file, file)

    return exports as any
}
