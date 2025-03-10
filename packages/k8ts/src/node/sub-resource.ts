import type { ManifestResource } from "./base"
import { AbsResource } from "./node"

export abstract class SubResource<Props extends object = object> extends AbsResource<Props> {
    constructor(
        readonly parent: ManifestResource,
        name: string,
        props: Props
    ) {
        super(parent.origin, name, props)
    }
}
