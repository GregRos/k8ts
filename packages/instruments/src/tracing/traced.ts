import { List } from "immutable"
import StackTracey from "stacktracey"

export class Traced {
    readonly trace?: List<StackTracey.Entry>

    constructor() {
        this.trace = List(new StackTracey().items)
    }
}
