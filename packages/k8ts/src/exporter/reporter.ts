import Emittery from "emittery"
import { List } from "immutable"
import { dump } from "js-yaml"
import type { AbsResource } from "../node/abs-resource"

export interface SummarizingEvent {
    resource: AbsResource
}
export interface SummarizerEventsTable {
    summarizing: SummarizingEvent
}
export interface SummarizerOptions {}
export class Summarizer extends Emittery<SummarizerEventsTable> {
    constructor(readonly options: SummarizerOptions) {
        super()
    }

    private _resource(resource: AbsResource): any {
        const subs = resource.subResources.map(sub => {
            const heading = sub.shortFqn
            const description = this._resource(sub)
            return { [heading]: description }
        })
        const depends = resource.dependencies.map(dep => `${dep.text} --> ${dep.resource.shortFqn}`)
        if (depends.length === 0 && subs.length === 0) {
            return null
        }
        return [...subs, ...depends]
    }

    private _resources(resources: AbsResource[]): object {
        const resourceContainer = List(resources)
            .map(resource => {
                return {
                    [resource.shortFqn]: this._resource(resource)
                }
            })
            .reduce(Object.assign)

        return resourceContainer
    }
    private _serialize(input: object) {
        const result = dump(input, {
            lineWidth: 800,
            noArrayIndent: true,
            indent: 2,
            noRefs: true
        })
        return result
    }
    resources(resources: AbsResource[]) {
        const obj = this._resources(resources)
        return this._serialize(obj)
    }
}
