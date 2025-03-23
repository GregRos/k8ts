import { relations } from "@k8ts/instruments"
import { AbsResource } from "./abs-resource"
import type { ManifestResource } from "./manifest-resource"

@relations({
    parent: self => self.parent
})
export abstract class SubResource<Props extends object = object> extends AbsResource<Props> {
    constructor(
        readonly parent: SubResource | ManifestResource,
        name: string,
        props: Props
    ) {
        super(parent.node.origin, name, props)
    }

    get namespace(): string | undefined {
        return this.parent.namespace
    }
}
