import { ManifestSourceEmbedder } from "@k8ts/instruments"
import ora from "ora"
import { setTimeout } from "timers/promises"
import type { Assembler, AssemblerEventsTable, AssemblyStage } from "./assembler"
import { attr, dest, quantity, stage, verb } from "./pretty-objects"
import { pretty } from "./pretty-print"
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
        let lastStage: AssemblyStage = "start"
        const unsub = typedOnAny(events, async event => {
            switch (event.type) {
                case "load":
                    spinner.text = pretty`${verb("Load")} ${attr(
                        event.isExported ? "exported" : "internal"
                    )} ${event.resource} `
                    break
                case "stage":
                    if (!this._options.debug) {
                        spinner.text = pretty`${stage(lastStage)}`
                        spinner.render()
                    }

                    console.log()
                    spinner.text = pretty`${stage(event.stage)}`
                    if (event.stage === "done") {
                        unsub()
                    }
                    lastStage = event.stage
                    break
                case "received-file":
                    spinner.text = pretty`${verb("Receive")} ${event.file}`
                    break
                case "serialize":
                    const rsc = ManifestSourceEmbedder.get(event.manifest)
                    spinner.text = pretty`${verb("Serialize")} ${rsc}`
                    break
                case "save":
                    spinner.text = pretty`${verb("Save")} ${dest(event.filename)} (${quantity(event.bytes, "byte")})`
                    break

                case "manifest":
                    spinner.text = pretty`${verb("Manifest")} ${event.resource}`
                    break
                case "purge":
                    spinner.text = pretty`${verb("Purge")} ${dest(event.outdir)}`
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
