import { attr, dest, ManifestSourceEmbedder, pretty, quantity, verb } from "@k8ts/instruments"
import ora from "ora"
import type { Assembler, AssemblerEventsTable } from "./assembler"
import { AssemblerStage } from "./stage"
export interface ProgressOptions {
    waitTransition?: number
    debug?: boolean
}

function typedOnAny(
    target: Assembler,
    handler: (
        typedEvent: {
            [K in keyof AssemblerEventsTable]: AssemblerEventsTable[K] & {
                type: K
            }
        }[keyof AssemblerEventsTable]
    ) => void | Promise<void>
) {
    return target.onAny((name, ev) => {
        return handler({ ...ev, type: name } as any)
    })
}

export class Engine_ProgressShower {
    constructor(private readonly _options: ProgressOptions) {}
    async visualize(events: Assembler) {
        const spinner = ora({
            spinner: "dots",
            text: "K8ts is getting ready..."
        })
        spinner.text = "abc"

        const unsub = typedOnAny(events, event => {
            switch (event.type) {
                case "load":
                    spinner.text = pretty`${verb("Load")} ${attr(
                        event.isExported ? "exported" : ""
                    )} ${event.resource} `
                    break
                case "stage":
                    if (event.stage !== "done") {
                        return
                    }
                    spinner.text = pretty`${AssemblerStage(event.stage)}`
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

            spinner.render()

            if (this._options.debug) {
                console.log()
            }
        })

        spinner.render()
    }
}
