from fastapi import APIRouter

router = APIRouter(prefix="/api/pages", tags=["Pages"])

PAGE_CONTENT = {
    "about": {
        "title": "About Insurance Bazaar",
        "subtitle": "India's most trusted AI-powered insurance marketplace.",
        "stats": [
            {"label": "Happy Customers", "value": "10M+"},
            {"label": "IRDAI Registered", "value": "100%"},
            {"label": "Claims Settled", "value": "5L+"},
            {"label": "Partners", "value": "50+"},
        ],
    },
    "contact": {
        "title": "Contact Us",
        "subtitle": "Have a question or need help? We're here for you 24/7.",
        "email": "support@insurancebazaar.app",
        "phone": "1800-208-8787",
        "claim_phone": "1800-258-5881",
        "address": "AI Insurance Bazaar Pvt. Ltd., Mumbai, Maharashtra, India",
    },
    "faq": {
        "title": "Frequently Asked Questions",
        "subtitle": "Find answers to common questions about insurance, policies, claims, and more.",
    },
    "privacy": {
        "title": "Privacy Policy",
        "subtitle": "Your privacy is important to us.",
        "last_updated": "1st January 2026",
    },
    "terms": {
        "title": "Terms of Use",
        "subtitle": "Please read these terms carefully before using our services.",
        "last_updated": "1st January 2026",
    },
    "grievance": {
        "title": "Grievance Redressal",
        "subtitle": "We are committed to resolving your concerns promptly and fairly.",
        "officer_name": "Mr. Rajesh Kumar",
        "officer_role": "Chief Grievance Officer",
        "officer_email": "grievance@insurancebazaar.app",
    },
    "claims": {
        "title": "Claims Procedure",
        "subtitle": "We make the claim process simple, transparent, and stress-free.",
    },
}


@router.get("/{page_name}")
async def get_page(page_name: str):
    content = PAGE_CONTENT.get(page_name)
    if not content:
        return {"error": "Page not found"}
    return content
