import ora from "ora"
import { setTimeout } from "timers/promises"
import type { Assembler, AssemblerEventsTable } from "./assembler"
export interface ProgressOptions {
    waitTransition: number
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
                    spinner.text = `Received file ${event.file}`
                    break
                case "serializing":
                    spinner.text = `Serializing ${event.manifest.shortFqn}`
                    break
                case "saving":
                    spinner.text = `Saving ${event.content.length} bytes to ${event.filename}`
                    break
                case "summarizing":
                    spinner.text = `Summarizing ${event.resource.shortFqn}`
                    break
                case "generating":
                    spinner.text = `Generating ${event.resource.shortFqn}`
                    break
                case "purging":
                    spinner.text = `Purging ${event.outdir}`
                    break
            }
            await setTimeout(200)
            spinner.render()
        })

        spinner.clear()
    }
}
