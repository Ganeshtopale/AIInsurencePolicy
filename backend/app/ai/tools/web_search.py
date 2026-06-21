import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class TavilySearchTool:
    BASE_URL = "https://api.tavily.com"

    def __init__(self):
        self.api_key = settings.TAVILY_API_KEY
        if not self.api_key:
            logger.warning("TAVILY_API_KEY is not configured. Web search will be unavailable.")

    async def search(
        self,
        query: str,
        max_results: int = 5,
        search_depth: str = "advanced",
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        if not self.api_key:
            return {"error": "Tavily API key not configured", "results": []}

        payload = {
            "api_key": self.api_key,
            "query": query,
            "max_results": max_results,
            "search_depth": search_depth,
        }
        if include_domains:
            payload["include_domains"] = include_domains
        if exclude_domains:
            payload["exclude_domains"] = exclude_domains

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.BASE_URL}/search",
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return {
                    "query": query,
                    "results": data.get("results", []),
                    "answer": data.get("answer"),
                    "response_time": data.get("response_time"),
                }
            except httpx.HTTPStatusError as e:
                logger.error(f"Tavily API HTTP error: {e.response.status_code} - {e.response.text}")
                return {"error": f"HTTP {e.response.status_code}", "results": []}
            except httpx.RequestError as e:
                logger.error(f"Tavily API request failed: {e}")
                return {"error": str(e), "results": []}

    async def search_insurance_premiums(
        self,
        policy_type: str,
        age: Optional[int] = None,
        coverage: Optional[float] = None,
        location: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        parts = [f"{policy_type} insurance premium rates"]
        if age:
            parts.append(f"age {age}")
        if coverage:
            parts.append(f"coverage {coverage:.0f}")
        if location:
            parts.append(f"in {location}")
        query = " ".join(parts)

        result = await self.search(query, max_results=5)
        premiums = self._extract_premium_data(result)

        return premiums

    def _extract_premium_data(self, search_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        premiums = []
        results = search_result.get("results", [])
        for item in results:
            premium_data = {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "content": item.get("content", ""),
                "source": "tavily",
            }
            premiums.append(premium_data)
        return premiums
