export type Access = Access.Inputs

export namespace Access {
    export type Mode = "ReadWriteOnce" | "ReadOnlyMany" | "ReadWriteMany"
    export type Input = Mode | "RWX" | "ROX" | "RWO"
    export type Inputs = Input | Input[]

    function parseOne(mode: Input): Mode {
        switch (mode) {
            case "RWX":
            case "ReadWriteMany":
                return "ReadWriteMany"
            case "ROX":
            case "ReadOnlyMany":
                return "ReadOnlyMany"
            case "RWO":
            case "ReadWriteOnce":
                return "ReadWriteOnce"
        }
    }

    export function parse(modes: Inputs): Mode[] {
        if (Array.isArray(modes)) {
            return modes.map(parseOne)
        } else {
            return [parseOne(modes)]
        }
    }
}
