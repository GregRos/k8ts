import type { Kind, Origin } from "@k8ts/instruments"
import { AbsResource } from "./abs-resource"

export abstract class TopResource<Props extends object = object> extends AbsResource<Props> {
    abstract override readonly api: Kind.Kind
    abstract readonly namespace: string | undefined
    constructor(origin: Origin, name: string, props: Props) {
        super(origin, name, props)
        origin.attach(this)
    }
}
