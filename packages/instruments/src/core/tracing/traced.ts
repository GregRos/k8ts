import { Embedder } from "../../utils/embedder"
import { Trace } from "./trace"

export const TraceEmbedder = new Embedder<object, Trace>("TRACED")
