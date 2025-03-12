import { List } from "immutable"
import type { AbsResource } from "../node/abs-resource"

export interface ReporterOptions {}
export class Reporter {
    constructor(readonly options: ReporterOptions) {}

    describe(resource: AbsResource): any {
        const subs = resource.subResources.map(sub => {
            const heading = sub.shortFqn
            const description = this.describe(sub)
            return { [heading]: description }
        })
        const depends = resource.dependencies.map(dep => `${dep.text} --> ${dep.resource.shortFqn}`)
        if (depends.length === 0 && subs.length === 0) {
            return null
        }
        return [...subs, ...depends]
    }

    describeAll(resources: AbsResource[]): object {
        const resourceContainer = List(resources)
            .map(resource => {
                return {
                    [resource.shortFqn]: this.describe(resource)
                }
            })
            .reduce(Object.assign)

        return resourceContainer
    }
}
