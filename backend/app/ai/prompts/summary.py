CONVERSATION_SUMMARY_PROMPT = """You are a lead generation analyst. Summarize the following customer conversation and extract key information for the sales team.

## Conversation to Summarize
Conversation:
{conversation}

## Extraction Requirements
Extract the following fields from the conversation. Return ONLY valid JSON with these exact keys:

{{
  "summary": "A 2-3 sentence summary of the conversation",
  "customer_name": "Customer's name or null",
  "customer_email": "Customer's email or null",
  "customer_phone": "Customer's phone or null",
  "age": "Customer's age (number) or null",
  "occupation": "Customer's occupation or null",
  "budget_range": "Budget range mentioned (e.g. '5000-10000 per month') or null",
  "coverage_amount": "Coverage amount mentioned (number) or null",
  "policy_type": "Type of policy interested in (term, health, motor, investment, travel) or null",
  "health_conditions": "Any health conditions mentioned or null",
  "has_existing_policies": true/false,
  "purchase_timeframe": "Timeframe for purchase (immediate, 1 month, 3 months, etc.) or null",
  "preferred_providers": "Any preferred insurance providers mentioned or null",
  "key_concerns": "List of key concerns or requirements mentioned",
  "conversation_tone": "Positive, Neutral, or Negative",
  "requirements_completeness": "How complete are the gathered requirements? high, medium, low"
}}

Respond with ONLY the JSON object, no other text."""


LEAD_SCORE_PROMPT = """Based on the following extracted customer information, generate a lead score from 0-100 and a purchase probability from 0-1.

Customer Information:
{requirements}

Consider:
- Age (25-45 is ideal for most insurance products -> higher score)
- Budget clarity (clear budget -> higher score)
- Coverage amount specified
- Purchase timeframe (immediate -> higher score)
- Health conditions (none mentioned -> higher score)
- Requirement completeness
- Conversation tone

Return ONLY a JSON object:
{{
  "lead_score": <number 0-100>,
  "purchase_probability": <number 0.0-1.0>,
  "scoring_reason": "<brief explanation of the score>"
}}"""
