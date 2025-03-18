import { ManifestSourceEmbedder } from "@k8ts/instruments"
import chalk from "chalk"
import ora from "ora"
import { setTimeout } from "timers/promises"
import type { Assembler, AssemblerEventsTable } from "./assembler"
import { attr, verb } from "./pretty-objects"
import { k8tsShow } from "./pretty-print"
export interface ProgressOptions {
    waitTransition: number
    debug: boolean
}

function typedOnAny(
    target: Assembler,
    handler: (
        typedEvent: {
            [K in keyof AssemblerEventsTable]: AssemblerEventsTable[K] & { type: K }
        }[keyof AssemblerEventsTable]
    ) => void | Promise<void>
) {
    return target.onAny((name, ev) => {
        return handler({ ...ev, type: name } as any)
    })
}

export class ProgressShower {
    constructor(private readonly _options: ProgressOptions) {}
    async visualize(events: Assembler) {
        const spinner = ora({
            spinner: "dots",
            text: "K8ts is getting ready..."
        })
        spinner.text = "abc"
        const unsub = typedOnAny(events, async event => {
            switch (event.type) {
                case "loading":
                    spinner.text = k8tsShow`${verb("Loading")} ${attr(event.subtype)} ${event.resource} `
                    break
                case "stage":
                    spinner.text = `Stage: ${event.stage}`
                    if (event.stage === "done") {
                        unsub()
                    }
                    break
                case "received-file":
                    spinner.text = k8tsShow`${chalk.italic("RECEIVED")} ${event.file}`
                    break
                case "serializing":
                    const rsc = ManifestSourceEmbedder.get(event.manifest)
                    spinner.text = k8tsShow`${chalk.italic("SERIALIZING")} ${rsc}`
                    break
                case "saving":
                    spinner.text = `Saving ${event.content.length} bytes to ${event.filename}`
                    break

                case "generating":
                    spinner.text = k8tsShow`${chalk.italic("RENDERING")} ${event.resource}`
                    break
                case "purging":
                    spinner.text = `Purging ${event.outdir}`
                    break
            }
            if (this._options.waitTransition) {
                await setTimeout(this._options.waitTransition)
            }
            spinner.render()

            if (this._options.debug) {
                console.log()
            }
        })

        spinner.clear()
    }
}
