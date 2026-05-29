from fastapi import APIRouter
from models.schemas import ChatResponse, ChatRequest
from agent.guardrails import run_input_guardrails
from agent.classifier import intent_classify
from agent.generator import generate
from actions.create_lead import create_lead

router = APIRouter()
sessions = {}

@router.post("/chat", response_model= ChatResponse)
def chat(request: ChatRequest):
    session_id = request.session_id
    message = request.message

    # Create or get session
    if session_id not in sessions:
        sessions[session_id] = {"history": []}
    
    session = sessions[session_id]

    # 1. guardrails
    guardrail_result = run_input_guardrails(message)
    if guardrail_result["blocked"]:
        # During lead capture, names/phone numbers look off-topic to the guardrails
        # but injection, moderation, and sensitive PII still block normally
        if session.get("awaiting_lead") and guardrail_result["reason"] == "off_topic":
            pass  # allow through — handled by lead capture interceptor below
        elif guardrail_result["reason"] == "off_topic":
            strikes = session.get("off_topic_strikes", 0) + 1
            session["off_topic_strikes"] = strikes
            if strikes == 1:
                return ChatResponse(text="I didn't quite catch that — could you tell me more about what you're looking for? I can help with pricing, scheduling, or questions about our services.", card=None)
            elif strikes == 2:
                return ChatResponse(text="I'm still not sure what you need. Are you looking for pricing, booking, or information about our services?", card=None)
            else:
                return ChatResponse(text="I'm sorry, I'm not able to help with that. Feel free to ask anything about our lawn care services.", card=None)
        else:
            return ChatResponse(text="I'm sorry, I can't help with that.", card=None)

    session["off_topic_strikes"] = 0

    # 2. merge pii into session
    pii = guardrail_result["pii"].get("extracted", {})
    session["name"] = pii.get("name") or session.get("name")
    session["phone"] = pii.get("phone") or session.get("phone")
    session["email"] = pii.get("email") or session.get("email")

    # 2.5 lead capture flow
    if session.get("awaiting_lead"):
        state = session["awaiting_lead"]
        session["history"].append({"role": "user", "content": message})
        if state == "name":
            session["name"] = message
            session["awaiting_lead"] = "phone"
            response_text = "Thanks! And your phone number?"
            session["history"].append({"role": "assistant", "content": response_text})
            return ChatResponse(text=response_text, card=None)
        elif state == "phone":
            phone = session.get("phone") or message
            create_lead(
                name=session.get("name", "Unknown"),
                phone=phone,
                email=session.get("email"),
                service_interest=session.get("service", "Unknown")
            )
            session.pop("awaiting_lead", None)
            session.pop("service", None)
            session.pop("yard_size", None)
            response_text = "Perfect! Our team will reach out to you shortly. Is there anything else I can help you with?"
            session["history"].append({"role": "assistant", "content": response_text})
            return ChatResponse(text=response_text, card=None)

    # 3. handling pending tool responses
    if session.get("pending_tool") == "price_estimator":
        service_map = {
            "weekly mowing": "mowing_weekly",
            "biweekly mowing": "mowing_biweekly",
            "spring cleanup": "spring_cleanup",
            "fall leaf removal": "fall_leaf_removal"
        }

        msg_lower = message.lower()
        if not session.get("service") and "?" not in msg_lower:
            for service_name, service_key in service_map.items():
                if service_name in msg_lower:
                    session["service"] = service_key
                    break
        if session.get("service") and not session.get("yard_size"):
            if "small" in msg_lower:
                session["yard_size"] = "small"
            elif "medium" in msg_lower:
                session["yard_size"] = "medium"
            elif "large" in msg_lower:
                session["yard_size"] = "large"

    # 4. append user message to history
    session["history"].append({"role": "user", "content": message})

    # 5. classify (skip if pending tool is complete)
    if session.get("pending_tool") == "price_estimator" and session.get("service") and "?" not in message:
        intent = "tool"
        confidence = 1.0
        tool = "price_estimator"
    else:
        classifier_result = intent_classify(guardrail_result["pii"].get("redacted_text", message), None if session.get("pending_tool") else session["history"][:-1])
        intent = classifier_result["intent"]
        confidence = classifier_result["confidence"]
        tool = classifier_result["tool"]
        
    # 6. generate
    response = generate(intent, confidence, tool, guardrail_result["pii"].get("redacted_text", message), session["history"], pii, session)

    # 7. append response to history
    session["history"].append({"role": "assistant", "content": response["text"]})

    # 8. return
    return ChatResponse(text=response["text"], card=response["card"])