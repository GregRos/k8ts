import StackTracey from "stacktracey"

export class Traced {
    readonly trace: StackTracey

    constructor() {
        this.trace = new StackTracey()
    }
}
