import type { Meta } from "@k8ts/metadata"
import { clone } from "lodash"
import StackTracey from "stacktracey"
import { MakeError } from "../error"
import { KEY, RefSpecifier, type RefSpec } from "../graph/referencing"
import { K8tsResources } from "../resources/kind-map"

export abstract class Base<Props extends object = object> {
    abstract readonly kind: string
    readonly trace: StackTracey
    get [KEY]() {
        return `${this.kind}:${this.name}` as const
    }
    constructor(
        readonly meta: Meta,
        readonly props: Props
    ) {
        this.trace = new StackTracey()
        ;(async () => {
            if (!K8tsResources.has(this.kind)) {
                throw new MakeError(`Resource of kind ${this.kind} is not registered!`)
            }
        })()
    }

    isMatch(spec: RefSpec) {
        const { kind, name } = RefSpecifier.parse(spec)
        return this.kind === kind && this.name === name
    }

    get name() {
        return this.meta.get("name")
    }

    setMeta(f: (m: Meta) => Meta): this {
        const myClone = clone(this) as any
        myClone["meta"] = f(this.meta)
        return myClone
    }

    abstract manifest(): object
}
