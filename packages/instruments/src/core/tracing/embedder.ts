import { Embedder } from "../../utils/mixin/embedder"
import { Trace_Source } from "./source"

export const TraceEmbedder = new Embedder<object, Trace_Source>("TRACED")
