import { defaults } from "lodash"
import { relative, resolve } from "path"
import StackTracey from "stacktracey"

export interface TraceFormatOptions {
    cwd: string
    absolute: boolean
}

export class Trace {
    constructor(readonly frame: StackTracey.Entry) {}

    format(inOptions?: Partial<TraceFormatOptions>) {
        const e = this.frame
        const options = defaults(inOptions, {
            cwd: ".",
            absolute: false
        }) as TraceFormatOptions
        options.cwd = resolve(options.cwd)
        const sourcePath = options.absolute ? e.file : relative(options.cwd, e.file)
        const relativeToCwd = relative(options.cwd, sourcePath)
        const sourceLocation = `${relativeToCwd}:${e.line}:${e.column}`
        return sourceLocation
    }
}
