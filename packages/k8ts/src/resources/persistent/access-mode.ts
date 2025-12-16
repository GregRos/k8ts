export type Access = Access.Pv_AccessMode_Inputs

export namespace Access {
    export type Pv_AccessMode = "ReadWriteOnce" | "ReadOnlyMany" | "ReadWriteMany"
    export type Pv_AccessMode_Input = Pv_AccessMode | "RWX" | "ROX" | "RWO"
    export type Pv_AccessMode_Inputs = Pv_AccessMode_Input | Pv_AccessMode_Input[]

    function parseOne(mode: Pv_AccessMode_Input): Pv_AccessMode {
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

    export function pv_parseAccessMode(modes: Pv_AccessMode_Inputs): Pv_AccessMode[] {
        if (Array.isArray(modes)) {
            return modes.map(parseOne)
        } else {
            return [parseOne(modes)]
        }
    }
}
