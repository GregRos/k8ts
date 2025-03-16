import type { Kind } from "@k8ts/instruments"
import { AbsResource } from "./abs-resource"

export abstract class TopResource<Props extends object = object> extends AbsResource<Props> {
    abstract override readonly kind: Kind.Kind
    abstract readonly namespace: string | undefined
}
