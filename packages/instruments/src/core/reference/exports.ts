import type { LiveRefable } from "."
import type { OriginEntity } from "../entities/origin/origin-entity"

export interface ExportsProps<
    Entity extends OriginEntity = OriginEntity,
    Produced extends LiveRefable = LiveRefable
> {
    origin: Entity
    PRODUCER: () => Iterable<Produced>
}
