import type { Cron_Record, Cron_RecordFromTuple, Cron_Tuple } from "./parse-type"
import { Cron_Stanza } from "./stanza"

function shorthand<Tpl extends Cron_Tuple>(...items: Tpl): Cron_Stanza<Cron_RecordFromTuple<Tpl>> {
    return new Cron_Stanza<Cron_RecordFromTuple<Tpl>>({
        minute: items[0],
        hour: items[1],
        dayOfMonth: items[2],
        month: items[3],
        dayOfWeek: items[4]
    })
}

export namespace Cron {
    export function from<R extends Cron_Record>(record: R): Cron_Stanza<R> {
        return new Cron_Stanza<R>(record)
    }

    export const minutely = shorthand(true, true, true, true, true)
    export const hourly = shorthand(0, true, true, true, true)
    export const daily = shorthand(0, 0, true, true, true)
    export const weekly = shorthand(0, 0, true, true, 0)
    export const monthly = shorthand(0, 0, 1, true, true)
    export const yearly = shorthand(0, 0, 1, 1, true)

    // TODO: Parse cron strings with type safety
    // TODO: Write a runtime parser too
    // TODO: Consider using an existing library for this
    export function parse(cron: string): Cron_Stanza<Cron_Record> {
        const parts = cron.split(" ")
        if (parts.length !== 5) {
            throw new Error(`Invalid cron string: ${cron}`)
        }
        return shorthand(...(parts as any))
    }
}
