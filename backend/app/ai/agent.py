import json
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage

from app.config import settings
from app.ai.prompts.chat import SYSTEM_PROMPT
from app.ai.prompts.summary import CONVERSATION_SUMMARY_PROMPT, LEAD_SCORE_PROMPT
from app.ai.rag.retriever import Retriever
from app.ai.rag.vector_store import VectorStore
from app.ai.tools.web_search import TavilySearchTool
from app.ai.tools.calculator import PremiumCalculator, PremiumInput
from app.ai.tools.policy_lookup import PolicyLookupTool

logger = logging.getLogger(__name__)


class InsuranceAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7,
            max_tokens=2000,
            api_key=settings.OPENAI_API_KEY,
        )

        self.llm_cold = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.3,
            max_tokens=1000,
            api_key=settings.OPENAI_API_KEY,
        )

        self.vector_store = VectorStore()
        self.retriever = Retriever(self.vector_store)
        self.web_search = TavilySearchTool()
        self.calculator = PremiumCalculator()
        self.policy_lookup = PolicyLookupTool()

        self.conversation_history: List[Dict[str, str]] = []
        self.extracted_requirements: Dict[str, Any] = {}

    async def process_message(
        self,
        user_message: str,
        user_id: Optional[int] = None,
        conversation_id: Optional[int] = None,
    ) -> str:
        self.conversation_history.append({"role": "user", "content": user_message})

        route = await self._route_query(user_message)
        logger.info(f"Routed query to: {route}")

        context = ""

        if route == "rag":
            context = await self._handle_rag(user_message)
        elif route == "web_search":
            context = await self._handle_web_search(user_message)
        elif route == "calculation":
            context = await self._handle_calculation(user_message)
        elif route == "policy_lookup":
            context = await self._handle_policy_lookup(user_message)
        else:
            context = ""

        response = await self._generate_response(user_message, context, route)
        self.conversation_history.append({"role": "assistant", "content": response})

        await self._extract_requirements_async(user_message)

        return response

    async def _route_query(self, query: str) -> str:
        q = query.lower()

        calc_keywords = [
            "calculate", "premium", "estimate", "how much", "cost",
            "price", "monthly", "yearly payment", "afford", "budget",
        ]
        rag_keywords = [
            "what is", "explain", "tell me about", "coverage",
            "term insurance", "health policy", "claim", "benefit",
            "exclusion", "waiting period", "document", "policy detail",
        ]
        search_keywords = [
            "latest", "live", "current rate", "market", "compare price",
            "best deal", "offer", "discount", "top plan", "trending",
            "new policy", "recent",
        ]
        lookup_keywords = [
            "show policy", "list policy", "find policy", "lookup",
            "policy details", "policy id", "available policy",
            "policies", "compare", "difference",
        ]

        calc_score = sum(1 for kw in calc_keywords if kw in q)
        rag_score = sum(1 for kw in rag_keywords if kw in q)
        search_score = sum(1 for kw in search_keywords if kw in q)
        lookup_score = sum(1 for kw in lookup_keywords if kw in q)

        if calc_score > 0 and calc_score >= max(rag_score, search_score, lookup_score):
            return "calculation"
        if search_score > 0 and search_score >= max(rag_score, calc_score, lookup_score):
            return "web_search"
        if lookup_score > 0 and lookup_score >= max(rag_score, calc_score, search_score):
            return "policy_lookup"
        if rag_score > 0:
            return "rag"

        routing_prompt = (
            f"Classify this user query into exactly one category:"
            f" 'rag', 'web_search', 'calculation', 'policy_lookup', or 'general'.\n"
            f"Query: {query}\n"
            f"Category:"
        )
        try:
            result = await self.llm_cold.ainvoke([HumanMessage(content=routing_prompt)])
            category = result.content.strip().lower()
            if category in ("rag", "web_search", "calculation", "policy_lookup", "general"):
                return category
        except Exception as e:
            logger.warning(f"LLM routing failed: {e}")

        return "general"

    async def _handle_rag(self, query: str) -> str:
        try:
            results = await self.retriever.retrieve(query, k=5)
            if results:
                return self.retriever.format_for_context(results)
        except Exception as e:
            logger.error(f"RAG retrieval failed: {e}")
        return ""

    async def _handle_web_search(self, query: str) -> str:
        try:
            result = await self.web_search.search(query)
            results = result.get("results", [])
            if results:
                context_parts = ["Web search results:"]
                for i, r in enumerate(results[:5]):
                    context_parts.append(
                        f"[{i + 1}] {r.get('title', '')}\n"
                        f"    {r.get('content', '')}\n"
                        f"    Source: {r.get('url', '')}"
                    )
                return "\n\n".join(context_parts)
        except Exception as e:
            logger.error(f"Web search failed: {e}")
        return ""

    async def _handle_calculation(self, query: str) -> str:
        try:
            params = await self._extract_premium_params(query)
            if params:
                result = self.calculator.calculate(PremiumInput(**params))
                return (
                    f"Premium Estimate:\n"
                    f"- Base Premium: {result.currency} {result.base_premium:,.2f}\n"
                    f"- Age Loading: {result.currency} {result.age_loading:,.2f}\n"
                    f"- Health Loading: {result.currency} {result.health_loading:,.2f}\n"
                    f"- Smoker Loading: {result.currency} {result.smoker_loading:,.2f}\n"
                    f"- Occupation Loading: {result.currency} {result.occupation_loading:,.2f}\n"
                    f"- Total Premium: {result.currency} {result.total_premium:,.2f}\n"
                    f"- Per Year: {result.currency} {result.premium_per_year:,.2f}"
                )
        except Exception as e:
            logger.error(f"Calculation failed: {e}")
        return ""

    async def _handle_policy_lookup(self, query: str) -> str:
        try:
            type_match = re.search(
                r"(term|health|motor|investment|travel)", query.lower()
            )
            if type_match:
                policies = await self.policy_lookup.lookup_by_type(type_match.group(1))
            else:
                policies = await self.policy_lookup.search_policies(query=query)

            if policies:
                parts = ["Available Policies:"]
                for p in policies[:5]:
                    parts.append(
                        f"- **{p['policy_name']}** by {p['provider']}\n"
                        f"  Type: {p['type']} | Premium: Rs {p['premium']:,.2f}/yr\n"
                        f"  Coverage: Rs {p['coverage_amount']:,.2f}\n"
                        f"  Claim Ratio: {p['claim_settlement_ratio'] or 'N/A'}%"
                    )
                return "\n\n".join(parts)
            return "No matching policies found in the database."
        except Exception as e:
            logger.error(f"Policy lookup failed: {e}")
            return ""

    async def _generate_response(
        self,
        user_message: str,
        context: str,
        route: str,
    ) -> str:
        messages = [SystemMessage(content=SYSTEM_PROMPT)]

        for msg in self.conversation_history[-20:-1]:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))

        if context:
            context_msg = (
                f"Here is relevant information to answer the user's query:\n\n{context}\n\n"
                f"Use this information to provide an accurate response. "
                f"If the information is insufficient, let the user know."
            )
            messages.append(SystemMessage(content=context_msg))

        messages.append(HumanMessage(content=user_message))

        try:
            response = await self.llm.ainvoke(messages)
            return response.content
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            return (
                "I'm sorry, I encountered an error processing your request. "
                "Please try again or contact support."
            )

    async def _extract_premium_params(self, query: str) -> Optional[Dict[str, Any]]:
        prompt = (
            f"Extract premium calculation parameters from this query. "
            f"Return ONLY valid JSON with these optional fields: "
            f"age (int), coverage_amount (float), tenure_years (int), "
            f"health_rating (excellent/good/standard/below_average), "
            f"smoker (bool), occupation_risk (low/medium/high), policy_type (term/health/motor/investment/travel).\n\n"
            f"Query: {query}\n\n"
            f"JSON:"
        )
        try:
            result = await self.llm_cold.ainvoke([HumanMessage(content=prompt)])
            cleaned = result.content.strip().strip("`").strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            params = json.loads(cleaned)
            params["age"] = int(params.get("age", 30))
            params["coverage_amount"] = float(params.get("coverage_amount", 1000000))
            params["tenure_years"] = int(params.get("tenure_years", 20))
            return params
        except Exception as e:
            logger.warning(f"Could not extract premium params: {e}")
            return None

    async def _extract_requirements_async(self, message: str):
        known_fields = {
            "age", "occupation", "budget_range", "coverage_amount",
            "policy_type", "health_conditions", "purchase_timeframe",
            "preferred_providers",
        }

        extraction_prompt = (
            f"From this customer message, extract any insurance requirement information. "
            f"Return ONLY valid JSON. Include only fields that are explicitly mentioned.\n"
            f"Possible fields: age (int), occupation (str), budget_range (str), "
            f"coverage_amount (float), policy_type (str), health_conditions (str), "
            f"purchase_timeframe (str), preferred_providers (str), customer_name (str), "
            f"customer_email (str), customer_phone (str).\n\n"
            f"Message: {message}\n\n"
            f"JSON:"
        )

        try:
            result = await self.llm_cold.ainvoke(
                [HumanMessage(content=extraction_prompt)]
            )
            cleaned = result.content.strip().strip("`").strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            extracted = json.loads(cleaned)

            for key, value in extracted.items():
                if value is not None and key in known_fields:
                    self.extracted_requirements[key] = value
        except Exception as e:
            logger.debug(f"No requirements extracted from message: {e}")

    async def summarize_conversation(self) -> Dict[str, Any]:
        conversation_text = "\n".join(
            f"{m['role']}: {m['content']}"
            for m in self.conversation_history
        )

        prompt = CONVERSATION_SUMMARY_PROMPT.format(
            conversation=conversation_text
        )

        try:
            result = await self.llm_cold.ainvoke([HumanMessage(content=prompt)])
            cleaned = result.content.strip().strip("`").strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            summary = json.loads(cleaned)
            return summary
        except Exception as e:
            logger.error(f"Failed to summarize conversation: {e}")
            return {
                "summary": "Failed to generate summary",
                "requirements_completeness": "low",
            }

    async def generate_lead_score(self) -> Dict[str, Any]:
        if not self.extracted_requirements:
            return {
                "lead_score": 0,
                "purchase_probability": 0.0,
                "scoring_reason": "No requirements gathered yet",
            }

        prompt = LEAD_SCORE_PROMPT.format(
            requirements=json.dumps(self.extracted_requirements, indent=2)
        )

        try:
            result = await self.llm_cold.ainvoke([HumanMessage(content=prompt)])
            cleaned = result.content.strip().strip("`").strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            score_data = json.loads(cleaned)
            return score_data
        except Exception as e:
            logger.error(f"Failed to generate lead score: {e}")
            return {
                "lead_score": 50,
                "purchase_probability": 0.5,
                "scoring_reason": "Default score due to error",
            }

    def get_conversation_history(self) -> List[Dict[str, str]]:
        return self.conversation_history.copy()

    def get_extracted_requirements(self) -> Dict[str, Any]:
        return self.extracted_requirements.copy()

    def reset_conversation(self):
        self.conversation_history.clear()
        self.extracted_requirements.clear()


_agent_instance: Optional["InsuranceAgent"] = None


def get_ai_agent() -> InsuranceAgent:
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = InsuranceAgent()
    return _agent_instance
