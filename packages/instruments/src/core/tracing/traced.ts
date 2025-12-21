import { Embedder } from "../../utils/_embedder"
import { Trace } from "./trace"

export const TraceEmbedder = new Embedder<object, Trace>("TRACED")
