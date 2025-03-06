import { ChildOrigin, Exports, type Origin } from "@k8ts/instruments"
import { Meta } from "@k8ts/metadata"
import { seq, type Seq } from "doddle"
import type { Base } from "../node/base"

export interface K8tsFileProps<T extends Base = Base, Factory = any> {
    readonly filename: string
    def(factory: Factory): Iterable<T>
}
export interface K8tsFile<T extends Base = Base> extends Exports<T>, Iterable<T> {
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
            return props.def(this.meta)
        }).cache()
    }

    get origin() {
        return this
    }
}

export function File<T extends Base>(parent: Origin, props: K8tsInnerFileProps<T>): K8tsFile<T> {
    const file = new _K8tsFile(parent, props)
    const exports = Exports.make(file, file.nodes)
    return Object.assign(exports, {
        props
    })
}
