import { ForwardExports, Trace_Git, Trace_Source } from "@k8ts/instruments"
import { Metadata } from "@k8ts/metadata"
import { seq } from "doddle"
import EventEmitter from "eventemitter3"
import StackTracey from "stacktracey"

import {
    Assembler,
    assemblerEventNames,
    Engine_ProgressShower,
    type AssemblerEventsTable,
    type AssemblerOptions,
    type ProgressOptions
} from "./engine"
import { Summarizer } from "./viz/summarizer"

export interface RunnerOptions extends AssemblerOptions {
    cwd?: string
    printOptions?: boolean
    progress: ProgressOptions
}

export class Runner {
    private _emitter = new EventEmitter()
    constructor(private readonly _options: RunnerOptions) {}
    on<Name extends keyof AssemblerEventsTable>(
        event: Name,
        listener: (payload: AssemblerEventsTable[Name]) => void
    ) {
        this._emitter.on(event, listener as any)
        return this
    }

    onAny(
        handler: <Name extends keyof AssemblerEventsTable>(
            name: Name,
            payload: AssemblerEventsTable[Name]
        ) => void
    ) {
        for (const eventName of assemblerEventNames) {
            this._emitter.on(eventName, (payload: unknown) => {
                handler(eventName, payload as any)
            })
        }
        return this
    }
    async run<Ts extends ForwardExports[]>(input: Ts) {
        const results = seq(input)
            .map(e => e.__entity__())
            .toArray()
            .pull()
        const gitInfo = await Trace_Git.create({
            cwd: this._options.cwd
        })

        const runTrace = new Trace_Source(new StackTracey().slice(1))
        const options = {
            cwd: ".",
            ...this._options,
            meta: new Metadata(this._options.meta)
                .add(`source.k8ts.org/`, {
                    "^emitted-at": runTrace.format({
                        cwd: this._options.cwd
                    })
                })
                .add(gitInfo?.metaFields)
        }

        const progressShower = new Engine_ProgressShower(options.progress)
        const assembler = new Assembler(options)
        assembler.onAny((name, ev) => {
            this._emitter.emit(name, ev)
        })
        const summarizer = new Summarizer({
            printOptions: this._options.printOptions
        })
        const visualizer = progressShower.visualize(assembler)
        const result = await assembler.assemble(results)

        const viz = summarizer.result(result)

        await visualizer
        console.log()
        console.log(viz)
    }
}
