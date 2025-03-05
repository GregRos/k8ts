import { Origin } from "@k8ts/instruments"
import type { InputMeta, Meta } from "@k8ts/metadata"

export class BaseScopeFactory {
    constructor(
        readonly origin: Origin,
        readonly extra: Meta
    ) {}

    _metaWithName(name: string) {
        return this.origin.meta.add({
            name
        })
    }

    child(name: string, meta?: InputMeta) {
        return new (this.constructor as any)(
            this.origin.child(name, this.extra),
            this.extra.add(meta ?? {})
        )
    }
}
