from fastapi import APIRouter

router = APIRouter(prefix="/api/home", tags=["Home"])

PARTNERS = [
    {"id": 1, "name": "HDFC Ergo", "brandColor": "#002f6c"},
    {"id": 2, "name": "ICICI Lombard", "brandColor": "#0099e5"},
    {"id": 3, "name": "Bajaj Allianz", "brandColor": "#004c97"},
    {"id": 4, "name": "Tata AIG", "brandColor": "#1a3668"},
    {"id": 5, "name": "Reliance General", "brandColor": "#004d99"},
    {"id": 6, "name": "SBI General", "brandColor": "#003366"},
    {"id": 7, "name": "Cholamandalam MS", "brandColor": "#1a3a5c"},
    {"id": 8, "name": "Kotak Mahindra", "brandColor": "#003399"},
    {"id": 9, "name": "Aditya Birla Health", "brandColor": "#003d7a"},
    {"id": 10, "name": "ManipalCigna", "brandColor": "#004b87"},
    {"id": 11, "name": "Star Health", "brandColor": "#c41e3a"},
    {"id": 12, "name": "Care Health", "brandColor": "#00a650"},
]

CALCULATORS = [
    {
        "category": "Investment",
        "icon": "TrendingUp",
        "items": [
            {"id": "sip", "title": "SIP Calculator", "description": "Plan your wealth growth with SIP", "link": "/calculators/sip"},
            {"id": "tax", "title": "Income Tax Calculator", "description": "Estimate your tax liability", "link": "/calculators/tax"},
            {"id": "ulip", "title": "ULIP Calculator", "description": "Calculate ULIP returns", "link": "/calculators/ulip"},
            {"id": "nps", "title": "NPS Calculator", "description": "Plan your retirement corpus", "link": "/calculators/nps"},
        ]
    },
    {
        "category": "Health & Wellness",
        "icon": "Heart",
        "items": [
            {"id": "bmi", "title": "BMI Calculator", "description": "Check your Body Mass Index", "link": "/calculators/bmi"},
            {"id": "ideal-weight", "title": "Ideal Weight Calculator", "description": "Find your ideal body weight", "link": "/calculators/ideal-weight"},
            {"id": "calorie", "title": "Calorie Calculator", "description": "Track daily calorie needs", "link": "/calculators/calorie"},
            {"id": "body-fat", "title": "Body Fat Calculator", "description": "Calculate body fat percentage", "link": "/calculators/body-fat"},
        ]
    },
    {
        "category": "Term Insurance",
        "icon": "Shield",
        "items": [
            {"id": "life-cover", "title": "Life Cover Calculator", "description": "Estimate cover needed", "link": "/calculators/life-cover"},
            {"id": "term-premium", "title": "Term Insurance Premium", "description": "Calculate term plan premium", "link": "/calculators/term-premium"},
            {"id": "hlv", "title": "Human Life Value", "description": "Calculate your human life value", "link": "/calculators/hlv"},
            {"id": "nri-term", "title": "NRI Term Insurance", "description": "Term insurance for NRIs", "link": "/calculators/nri-term"},
        ]
    },
    {
        "category": "Policy Premium",
        "icon": "Wallet",
        "items": [
            {"id": "health-premium", "title": "Health Premium", "description": "Check health insurance cost", "link": "/calculators/health-premium"},
            {"id": "car-premium", "title": "Car Insurance Premium", "description": "Calculate car insurance rate", "link": "/calculators/car-premium"},
            {"id": "bike-premium", "title": "Bike Insurance Premium", "description": "Calculate bike insurance cost", "link": "/calculators/bike-premium"},
            {"id": "travel-premium", "title": "Travel Insurance Premium", "description": "Check travel insurance cost", "link": "/calculators/travel-premium"},
        ]
    },
]


@router.get("")
async def get_home_data():
    return {"partners": PARTNERS, "calculators": CALCULATORS}
