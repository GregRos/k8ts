import { displayers } from "@k8ts/instruments"
import chalk from "chalk"
import { AssemblyStage } from "./assembler"

@displayers({
    simple: s => s.text,
    pretty: stage => chalk.bgGreenBright.bold.black(` ${stage.text} `)
})
export class Stage {
    text: string
    constructor(private stage: AssemblyStage) {
        this.text = `${stage.toUpperCase()}`
    }

    private get _emoji() {
        switch (this.stage) {
            case "gathering":
                return "🛒"
            case "loading":
                return "🚚"
            case "manifesting":
                return "👻"
            case "start":
                return "🚀"
            case "saving":
                return "💾"
            case "serializing":
                return "🖨️"
            case "done":
                return "✅"
        }
    }
}
export function stage(stage: AssemblyStage) {
    return new Stage(stage)
}
