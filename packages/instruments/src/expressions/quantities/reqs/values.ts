import { isEmpty, mapValues, merge } from "lodash"
import type { Reqs_ReqLimit } from "./types"

export class Reqs_Values {
    constructor(private _record: Record<string, Reqs_ReqLimit>) {}

    toObject() {
        const kubernetesForm = mapValues(this._record, (value, key) => {
            const result = {} as any
            if (value.request) {
                result.requests = {
                    [key]: value.request.val
                }
            }
            if (value.limit) {
                result.limits = {
                    [key]: value.limit.val
                }
            }
            if (!isEmpty(result)) {
                return result
            }
            return undefined
        })

        return merge({}, ...Object.values(kubernetesForm).filter(x => x !== undefined))
    }
}
