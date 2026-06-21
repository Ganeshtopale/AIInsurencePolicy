import json
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(
        self,
        persist_directory: str = "data/vector_store",
        dimension: int = 1536,
    ):
        self.dimension = dimension
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)

        self._documents: List[Dict[str, Any]] = []
        self._embeddings: np.ndarray = np.empty((0, dimension))
        self._load()

    def add_documents(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: Optional[List[Dict]] = None,
        ids: Optional[List[str]] = None,
    ) -> List[str]:
        if not texts or not embeddings:
            return []

        if metadatas is None:
            metadatas = [{} for _ in texts]
        if ids is None:
            ids = [f"doc_{len(self._documents) + i}" for i in range(len(texts))]

        new_embeddings = np.array(embeddings, dtype=np.float32)
        if new_embeddings.shape[1] != self.dimension:
            raise ValueError(
                f"Embedding dimension {new_embeddings.shape[1]} "
                f"does not match store dimension {self.dimension}"
            )

        for i, text in enumerate(texts):
            self._documents.append({
                "id": ids[i],
                "text": text,
                "metadata": metadatas[i] if i < len(metadatas) else {},
            })

        if self._embeddings.shape[0] == 0:
            self._embeddings = new_embeddings
        else:
            self._embeddings = np.vstack([self._embeddings, new_embeddings])

        self._save()
        return ids

    def similarity_search(
        self,
        query_embedding: List[float],
        k: int = 5,
        score_threshold: Optional[float] = None,
    ) -> List[Dict[str, Any]]:
        if self._embeddings.shape[0] == 0:
            return []

        query_vec = np.array(query_embedding, dtype=np.float32).reshape(1, -1)
        scores = cosine_similarity(query_vec, self._embeddings)[0]

        if score_threshold is not None:
            valid_indices = np.where(scores >= score_threshold)[0]
        else:
            valid_indices = np.argsort(scores)[::-1]

        top_k = valid_indices[:k]
        results = []
        for idx in top_k:
            results.append({
                "id": self._documents[idx]["id"],
                "text": self._documents[idx]["text"],
                "metadata": self._documents[idx]["metadata"],
                "score": float(scores[idx]),
            })

        return results

    def delete_document(self, doc_id: str) -> bool:
        for i, doc in enumerate(self._documents):
            if doc["id"] == doc_id:
                self._documents.pop(i)
                self._embeddings = np.delete(self._embeddings, i, axis=0)
                self._save()
                return True
        logger.warning(f"Document {doc_id} not found in vector store")
        return False

    def get_all_documents(self) -> List[Dict[str, Any]]:
        return self._documents.copy()

    def count(self) -> int:
        return len(self._documents)

    def clear(self):
        self._documents.clear()
        self._embeddings = np.empty((0, self.dimension))
        self._save()

    def _save(self):
        docs_path = self.persist_directory / "documents.json"
        embeddings_path = self.persist_directory / "embeddings.npy"

        serializable_docs = []
        for doc in self._documents:
            serializable_docs.append({
                "id": doc["id"],
                "text": doc["text"],
                "metadata": doc["metadata"],
            })

        with open(docs_path, "w", encoding="utf-8") as f:
            json.dump(serializable_docs, f, ensure_ascii=False, indent=2)

        np.save(str(embeddings_path), self._embeddings)

    def _load(self):
        docs_path = self.persist_directory / "documents.json"
        embeddings_path = self.persist_directory / "embeddings.npy"

        if docs_path.exists() and embeddings_path.exists():
            try:
                with open(docs_path, "r", encoding="utf-8") as f:
                    self._documents = json.load(f)

                self._embeddings = np.load(str(embeddings_path))
                logger.info(
                    f"Loaded {len(self._documents)} documents from "
                    f"{self.persist_directory}"
                )
            except Exception as e:
                logger.error(f"Failed to load vector store: {e}")
                self._documents = []
                self._embeddings = np.empty((0, self.dimension))
