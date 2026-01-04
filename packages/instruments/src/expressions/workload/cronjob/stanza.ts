import { displayers } from "../../../utils/displayers"
import type { Cron_Element, Cron_Record, Cron_RecordToTuple } from "./parse-type"
import type { _SetObjectKey } from "./types"

export declare const CRON_STRING: unique symbol

function _convertStanzaElement(X: Cron_Element): string {
    if (X === true) {
        return "*"
    }
    if (X === false) {
        return "0"
    }
    return `${X}`
}
@displayers({
    simple(self) {
        return self.string
    }
})
export class Cron_Stanza<R extends Cron_Record> {
    constructor(private readonly _parts: R) {}

    get tuple() {
        return [
            this._parts.minute,
            this._parts.hour,
            this._parts.dayOfMonth,
            this._parts.month,
            this._parts.dayOfWeek
        ] as Cron_RecordToTuple<R>
    }

    get string() {
        return this.tuple.map(_convertStanzaElement).join(" ")
    }

    minute<Minute extends Cron_Element>(
        minute: Minute
    ): Cron_Stanza<_SetObjectKey<R, "minute", Minute>> {
        return new Cron_Stanza<_SetObjectKey<R, "minute", Minute>>({
            ...this._parts,
            minute
        } as any)
    }

    hour<Hour extends Cron_Element>(hour: Hour): Cron_Stanza<_SetObjectKey<R, "hour", Hour>> {
        return new Cron_Stanza<_SetObjectKey<R, "hour", Hour>>({
            ...this._parts,
            hour
        } as any)
    }

    dayOfMonth<DayOfMonth extends Cron_Element>(
        dayOfMonth: DayOfMonth
    ): Cron_Stanza<_SetObjectKey<R, "dayOfMonth", DayOfMonth>> {
        return new Cron_Stanza<_SetObjectKey<R, "dayOfMonth", DayOfMonth>>({
            ...this._parts,
            dayOfMonth
        } as any)
    }

    month<Month extends Cron_Element>(month: Month): Cron_Stanza<_SetObjectKey<R, "month", Month>> {
        return new Cron_Stanza<_SetObjectKey<R, "month", Month>>({
            ...this._parts,
            month
        } as any)
    }

    dayOfWeek<DayOfWeek extends Cron_Element>(
        dayOfWeek: DayOfWeek
    ): Cron_Stanza<_SetObjectKey<R, "dayOfWeek", DayOfWeek>> {
        return new Cron_Stanza<_SetObjectKey<R, "dayOfWeek", DayOfWeek>>({
            ...this._parts,
            dayOfWeek
        } as any)
    }
}
