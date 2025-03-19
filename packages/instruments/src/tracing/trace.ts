import { defaults } from "lodash"
import { relative, resolve } from "path"
import StackTracey from "stacktracey"

export interface TraceFormatOptions {
    cwd: string
    absolute: boolean
}

export class Trace {
    readonly trace: StackTracey.Entry
    constructor(trace: StackTracey) {
        const findGoodFrame = (e: StackTracey.Entry) => {
            return !e.native && e.file && !e.file.includes("node:")
        }
        this.trace = trace.filter(x => !!findGoodFrame(x)).at(0)
    }

    format(inOptions?: Partial<TraceFormatOptions>) {
        const e = this.trace
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
