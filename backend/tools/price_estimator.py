PRICES = {
    "mowing_weekly": {
        "small": 45,
        "medium": 65,
        "large": 85
    },
    "mowing_biweekly": {
        "small": 50,
        "medium": 72,
        "large": 95
    },
    "spring_cleanup": {
        "small": 180,
        "medium": 250,
        "large": 320
    },
    "fall_leaf_removal": {
        "small": 150,
        "medium": 215,
        "large": 280
    }
}

def price_estimator(service, yard_size, addons=[]):
    if service not in PRICES:
        return {"error": f"Unknown service: {service}"}
    
    if yard_size not in PRICES[service]:
        return {"error": f"Unknown yard size: {yard_size}"}
    
    price = PRICES[service][yard_size]
    
    return {
        "service": service,
        "yard_size": yard_size,
        "price": f"${price}",
        "note": "Includes edging, string-trimming, and blowing clippings off all hard surfaces."
    }