import { Embedder } from "../../utils/mixin/embedder"
import { Trace_SourceCode } from "./trace"

export const TraceEmbedder = new Embedder<object, Trace_SourceCode>("TRACED")
