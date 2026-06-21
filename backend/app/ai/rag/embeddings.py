import os
import logging
from typing import List
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.documents import Document
from app.config import settings

logger = logging.getLogger(__name__)

_embeddings = None


def get_embeddings() -> OpenAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured")
        _embeddings = OpenAIEmbeddings(
            model="text-embedding-ada-002",
            openai_api_key=settings.OPENAI_API_KEY,
        )
    return _embeddings


async def embed_text(text: str) -> List[float]:
    embeddings = get_embeddings()
    return await embeddings.aembed_query(text)


async def embed_texts(texts: List[str]) -> List[List[float]]:
    embeddings = get_embeddings()
    return await embeddings.aembed_documents(texts)


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 100,
) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.create_documents([text])


async def chunk_pdf(file_path: str) -> List[Document]:
    loader = PyPDFLoader(file_path)
    documents = await loader.aload()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.split_documents(documents)


async def chunk_text_file(file_path: str) -> List[Document]:
    loader = TextLoader(file_path, encoding="utf-8")
    documents = await loader.aload()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.split_documents(documents)
