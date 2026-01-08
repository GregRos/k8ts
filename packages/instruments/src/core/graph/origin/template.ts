import type { Resource, ResourceRef } from "../resource"
import type { Origin_Props } from "./node"
import { Origin } from "./origin"
export interface TemplateOrigin_Props extends Origin_Props {
    owner: Resource
}
export class TemplateOrigin extends Origin<TemplateOrigin_Props> {
    #_ = (() => {
        this.on("resource/manifested", e => {
            // Templated resources should never have a namespace when manifested
            // But they still need to keep track of it internally for validation
            if (e.manifest?.metadata?.namespace) {
                delete e.manifest.metadata.namespace
            }
        })
    })()
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
