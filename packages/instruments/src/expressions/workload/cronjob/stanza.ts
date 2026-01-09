import { display } from "../../../utils/mixin/display"
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
export interface CronStanza<R extends Cron_Record = Cron_Record> {
    get tuple(): Cron_RecordToTuple<R>
    toString(): string
    get string(): string
    minute<Minute extends Cron_Element>(
        minute: Minute
    ): CronStanza<_SetObjectKey<R, "minute", Minute>>
    hour<Hour extends Cron_Element>(hour: Hour): CronStanza<_SetObjectKey<R, "hour", Hour>>
    dayOfMonth<DayOfMonth extends Cron_Element>(
        dayOfMonth: DayOfMonth
    ): CronStanza<_SetObjectKey<R, "dayOfMonth", DayOfMonth>>
    month<Month extends Cron_Element>(month: Month): CronStanza<_SetObjectKey<R, "month", Month>>
    dayOfWeek<DayOfWeek extends Cron_Element>(
        dayOfWeek: DayOfWeek
    ): CronStanza<_SetObjectKey<R, "dayOfWeek", DayOfWeek>>
}
export function CronStanza<R extends Cron_Record>(record: R) {
    return new _CronStanza(record) as CronStanza<R>
}
@display({
    simple(self) {
        return self.string
    }
})
class _CronStanza {
    constructor(private readonly _parts: Cron_Record) {}

    get tuple() {
        return [
            this._parts.minute,
            this._parts.hour,
            this._parts.dayOfMonth,
            this._parts.month,
            this._parts.dayOfWeek
        ] as Cron_RecordToTuple<Cron_Record>
    }

    get string() {
        return this.tuple.map(_convertStanzaElement).join(" ")
    }

    minute<Minute extends Cron_Element>(minute: Minute): _CronStanza {
        return new _CronStanza({
            ...this._parts,
            minute
        } as any)
    }

    hour<Hour extends Cron_Element>(hour: Hour): _CronStanza {
        return new _CronStanza({
            ...this._parts,
            hour
        } as any)
    }

    dayOfMonth<DayOfMonth extends Cron_Element>(dayOfMonth: DayOfMonth): _CronStanza {
        return new _CronStanza({
            ...this._parts,
            dayOfMonth
        } as any)
    }

    month<Month extends Cron_Element>(month: Month): _CronStanza {
        return new _CronStanza({
            ...this._parts,
            month
        } as any)
    }

    dayOfWeek<DayOfWeek extends Cron_Element>(dayOfWeek: DayOfWeek): _CronStanza {
        return new _CronStanza({
            ...this._parts,
            dayOfWeek
        } as any)
    }
}
