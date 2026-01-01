Origin events allow you to customize all [[Resource|Resources]] attached to an [[Origin]]. These events include:

| Event name            | Description                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `resource/attached`   | [[Resource]] is attached to the [[Origin]]                                                             |
| `resource/exported`   | [[Resource]] is exported via a `yield` statement                                                       |
| `resource/manifested` | [[Resource]] is rendered to a [[manifest]]. Allows modifying the manifest before it’s written to file. |
| `resource/loaded`     | [[Resource]] is loaded by the [[assembler]].                                                           |
| `resource/serialized` | [[manifest]] is serialized into YAML. Allows modifying the YAML content.                               |
These events allow you to modify [[Resource|Resources]] and how they’re rendered to [[manifest|manifests]]. 

Events can be used at every [[Origin]], from a [[World]] to a [[Section]]. They bubble up the [[Origin]] tree, so that a [[World]] receives all events for all [[Resource|Resources]]. 

> [!ai] INSERT code sample: listening and triggering World events.
> Code showing subscribing to the events of a World

