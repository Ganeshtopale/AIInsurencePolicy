import logging
from typing import List, Optional, Dict, Any
from app.ai.rag.embeddings import embed_text
from app.ai.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)


class Retriever:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store

    async def retrieve(
        self,
        query: str,
        k: int = 5,
        score_threshold: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        query_embedding = await embed_text(query)
        results = self.vector_store.similarity_search(
            query_embedding=query_embedding,
            k=k,
            score_threshold=score_threshold,
        )
        return results

    def format_for_llm(
        self,
        results: List[Dict[str, Any]],
        max_tokens: int = 2000,
    ) -> str:
        if not results:
            return ""

        context_parts = []
        token_estimate = 0

        for i, result in enumerate(results):
            text = result["text"]
            score = result["score"]
            source = result["metadata"].get("source", "unknown")

            formatted = f"[Document {i + 1}] (relevance: {score:.2f}, source: {source})\n{text}\n"
            estimated_tokens = len(formatted) // 4

            if token_estimate + estimated_tokens > max_tokens:
                remaining = max_tokens - token_estimate
                formatted = formatted[: remaining * 4]
                context_parts.append(formatted)
                break

            context_parts.append(formatted)
            token_estimate += estimated_tokens

        return "\n".join(context_parts)

    def format_for_context(
        self,
        results: List[Dict[str, Any]],
    ) -> str:
        sections = []
        for i, r in enumerate(results):
            sections.append(
                f"--- Policy Document {i + 1} (score: {r['score']:.2f}) ---\n"
                f"{r['text']}\n"
            )
        return "\n".join(sections)
