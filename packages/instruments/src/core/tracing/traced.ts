import { Embedder } from "../../utils/embedder"
import { Trace_SourceCode } from "./trace"

export const TraceEmbedder = new Embedder<object, Trace_SourceCode>("TRACED")
