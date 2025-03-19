export type Producer<Factory extends object, Thing extends object> = Producer.Producer<
    Factory,
    Thing
>
export namespace Producer {
    export type Producer<Factory extends object, Produced extends object> = (
        factory: Factory
    ) => Iterable<Produced>

    export function map<Factory extends object, Produced extends object, NewInput extends object>(
        producer: Producer<Factory, Produced>,
        projection: (input: NewInput) => Factory
    ) {
        return function bound_producer(input: NewInput) {
            return producer(projection(input))
        }
    }
}
