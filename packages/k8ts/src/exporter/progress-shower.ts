import { ManifestSourceEmbedder } from "@k8ts/instruments"
import ora from "ora"
import { setTimeout } from "timers/promises"
import type { Assembler, AssemblerEventsTable } from "./assembler"
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
                    spinner.text = `Loading ${event.resource.shortFqn} (${event.subtype})`
                    break
                case "stage":
                    spinner.text = `Stage: ${event.stage}`
                    if (event.stage === "done") {
                        unsub()
                    }
                    break
                case "received-file":
                    spinner.text = `Received file ${event.file.__origin__.name}`
                    break
                case "serializing":
                    const rsc = ManifestSourceEmbedder.get(event.manifest)
                    spinner.text = `Serializing ${rsc.shortFqn}`
                    break
                case "saving":
                    spinner.text = `Saving ${event.content.length} bytes to ${event.filename}`
                    break

                case "generating":
                    spinner.text = `Generating ${event.resource.shortFqn}`
                    break
                case "purging":
                    spinner.text = `Purging ${event.outdir}`
                    break
            }
            if (this._options.waitTransition) {
                await setTimeout(this._options.waitTransition)
            }
            if (this._options.debug) {
                console.log()
            }
            spinner.render()
        })

        spinner.clear()
    }
}
