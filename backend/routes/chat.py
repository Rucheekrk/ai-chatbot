from fastapi import APIRouter
from models.schemas import ChatResponse, ChatRequest
from agent.guardrails import run_input_guardrails
from agent.classifier import intent_classify
from agent.generator import generate

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
        return ChatResponse(text="I'm sorry, I can't help with that.", card=None)

    # 2. merge pii into session
    pii = guardrail_result["pii"].get("extracted", {})
    session["name"] = pii.get("name") or session.get("name")
    session["phone"] = pii.get("phone") or session.get("phone")
    session["email"] = pii.get("email") or session.get("email")

    # 3. handling pending tool responses
    if session.get("pending_tool") == "price_estimator":
        service_map = {
            "weekly mowing": "mowing_weekly",
            "biweekly mowing": "mowing_biweekly",
            "spring cleanup": "spring_cleanup",
            "fall leaf removal": "fall_leaf_removal"
        }

        msg_lower = message.lower()
        if not session.get("service") and msg_lower in service_map:
            session["service"] = service_map[msg_lower]
        elif not session.get("yard_size"):
            if "small" in msg_lower:
                session["yard_size"] = "small"
            elif "medium" in msg_lower:
                session["yard_size"] = "medium"
            elif "large" in msg_lower:
                session["yard_size"] = "large"

    # 4. append user message to history
    session["history"].append({"role": "user", "content": message})

    # 5. classify (skip if pending tool is complete)
    if session.get("pending_tool") == "price_estimator" and session.get("service") and session.get("yard_size"):
        intent = "tool"
        confidence = 1.0
        tool = "price_estimator"
    else:
        classifier_result = intent_classify(guardrail_result["pii"].get("redacted_text", message))
        intent = classifier_result["intent"]
        confidence = classifier_result["confidence"]
        tool = classifier_result["tool"]
        
    # 6. generate
    response = generate(intent, confidence, tool, guardrail_result["pii"].get("redacted_text", message), session["history"], pii, session)

    # 7. append response to history
    session["history"].append({"role": "assistant", "content": response["text"]})

    # 8. return
    return ChatResponse(text=response["text"], card=response["card"])