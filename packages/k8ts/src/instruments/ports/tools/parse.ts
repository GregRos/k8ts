import { anyStringOf, int, string } from "parjs"
import { map, maybe, must, qthen, then } from "parjs/combinators"
import { PortError } from "../error"
import type { InputPortSetEntry, Protocol } from "../types"

function validatePort(port: number) {
    if (port < 0 || port > 65535) {
        return {
            kind: "Hard" as const,
            message: "Port must be between 0 and 65535"
        }
    }
    return true
}
const pProtocol = anyStringOf("tcp", "udp", "TCP", "UDP").pipe(
    map(s => s.toUpperCase() as Protocol)
)

const pPort = int().pipe(must(validatePort))
const pProtocolPart = string("/").pipe(qthen(pProtocol), maybe("TCP"))
const pPortSpec = pPort.pipe(
    then(pProtocolPart),
    map(arr => {
        const [port, protocol] = arr
        return {
            port,
            protocol: protocol?.toUpperCase() ?? "TCP"
        } as InputPortSetEntry
    })
)

export function parsePortSpec(name: string, input: string) {
    const result = pPortSpec.parse(input)
    if (result.kind === "OK") {
        return result.value
    }
    throw new PortError(name, {
        parseError: result.reason
    })
}
