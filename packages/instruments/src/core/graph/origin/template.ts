import { ResourceEntity, ResourceRef } from "../resource"
import { OriginEntity } from "./origin"
import type { Origin_Props } from "./props"
export interface TemplateOrigin_Props extends Origin_Props {
    owner: ResourceEntity
}
export class TemplateOrigin extends OriginEntity<TemplateOrigin_Props> {
    #_ = (() => {
        this.on("resource/manifested", e => {
            // Templated resources should never have a namespace when manifested
            // But they still need to keep track of it internally for validation
            if (e.manifest?.metadata?.namespace) {
                delete e.manifest.metadata.namespace
            }
        })
        this.noEmit = true
    })()

    get __parent__() {
        return this.owner.cast(ResourceEntity)["__origin__"]
    }
    get namespace() {
        return this.owner.ident.namespace
    }
    get kind() {
        return "Template"
    }
    get owner() {
        return this._props.owner
    }

    attach<T extends ResourceRef>(scope: () => T): T {
        const bound = this.__bind__(scope)
        return bound()
    }
}
