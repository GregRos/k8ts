import { type ASeq } from "doddle"
import ora from "ora"
import type { AnyAssemblerEvent } from "./assembler"
export interface VisualizerOptions {
    waitTransition: number
}

export class ProgressShower {
    spinner = ora("K8ts is getting ready...")
    constructor() {}

    async visualize(events: ASeq<AnyAssemblerEvent>) {
        await events
            .matchMap("type", {
                stage: async ({ stage }) => {
                    this.spinner.start(`STAGE: ${stage}`)
                },
                "received-file": ({ file }) => {
                    this.spinner.start(`Got file: ${file.__origin__.name}`)
                },
                serializing: ({ manifest }) => {
                    this.spinner.start(`Serializing ${manifest.kind}/${manifest.name}`)
                },
                saving: ({ filename, content }) => {
                    this.spinner.start(`Saving ${content.length} bytes to ${filename}`)
                },
                summarizing: ({ resource }) => {
                    this.spinner.start(`Summarizing ${resource.shortFqn}`)
                },
                generating: ({ resource }) => {
                    this.spinner.start(`Generating ${resource.shortFqn}`)
                },
                purging: ({ outdir }) => {
                    this.spinner.warn(`Purging ${outdir}`)
                }
            })
            .delay(100)
            .drain()
            .pull()
    }
}
