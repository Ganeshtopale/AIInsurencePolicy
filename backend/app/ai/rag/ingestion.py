import logging
from pathlib import Path
from typing import List

from app.ai.rag.embeddings import embed_texts, chunk_text
from app.ai.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)

DOCUMENTS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data" / "policy_documents"


def _load_markdown_files() -> List[str]:
    if not DOCUMENTS_DIR.exists():
        logger.warning(f"Policy documents directory not found: {DOCUMENTS_DIR}")
        return []
    files = sorted(DOCUMENTS_DIR.glob("*.md"))
    if not files:
        logger.warning(f"No markdown files found in {DOCUMENTS_DIR}")
        return []
    texts = []
    for fp in files:
        text = fp.read_text(encoding="utf-8").strip()
        if text:
            texts.append(text)
            logger.info(f"Loaded {fp.name} ({len(text)} chars)")
    return texts


async def run_ingestion(vector_store: VectorStore) -> int:
    raw_docs = _load_markdown_files()
    if not raw_docs:
        logger.warning("No documents to ingest")
        return 0

    all_chunks = []
    all_metadatas = []
    for i, doc in enumerate(raw_docs):
        chunks = chunk_text(doc)
        for c in chunks:
            all_chunks.append(c.page_content)
            all_metadatas.append({"source": f"policy_document_{i}"})

    logger.info(f"Generated {len(all_chunks)} chunks from {len(raw_docs)} documents")

    if not all_chunks:
        return 0

    try:
        embeddings = await embed_texts(all_chunks)
    except Exception as e:
        logger.error(f"Embedding generation failed (check API key/quota): {e}")
        return 0

    vector_store.add_documents(
        texts=all_chunks,
        embeddings=embeddings,
        metadatas=all_metadatas,
    )
    logger.info(f"Ingested {len(all_chunks)} chunks into vector store")
    return len(all_chunks)
