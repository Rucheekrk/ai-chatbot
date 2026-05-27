import openai
from config import OPENAI_API_KEY, GENERATOR_MODEL
from rag.retriever import retrieve
from tools.price_estimator import price_estimator
from actions.create_lead import create_lead
from actions.create_handoff import create_handoff


client = openai.OpenAI(api_key = OPENAI_API_KEY)

def generate(intent, confidence, tool, user_message, chat_history, pii, session):

    if intent == "rag":
        chunks = retrieve(user_message)
        context = "\n\n".join([chunk["content"] for chunk in chunks])  # combines ALL chunks at once

        prompt = f"""You are Sage, a friendly AI assistant for Green Acres Lawn Care, a residential lawn care business in the Atlanta metro area.

        Answer the user's question using only the information provided below. If the answer is not in the context, say you don't have that information and offer to connect them with the team.

        Context:
        {context}"""

        response = client.chat.completions.create(
            model = GENERATOR_MODEL,
            messages = [{"role": "system", "content": prompt}] +
                chat_history +
                [{"role": "user", "content": user_message}]
            )
        
        return {"text": response.choices[0].message.content, "card": None}
    
    
    elif intent == "tool":
        if tool == "price_estimator":
            service = session.get("service")
            yard_size = session.get("yard_size")

            if not service:
                session["pending_tool"] = "price_estimator"
                return {"text": "What service are you interested in?", "card": {"type": "options", "options": ["weekly mowing", "biweekly mowing", "spring cleanup", "fall leaf removal"]}}

            if not yard_size:
                return {"text": "What is your yard size?", "card": {"type": "options", "options": ["Small (up to ¼ acre)", "Medium (¼ to ½ acre)", "Large (over ½ acre)"]}}
            
            result = price_estimator(service, yard_size)
            service_display = service.replace("_", " ").title()
            session.pop("pending_tool", None)
            # TODO: handle "Reach out to me later" — collect name/phone across turns and call create_lead
            return {
                "text": f"For a {yard_size} yard, {service_display} is {result['price']}. {result['note']}\n\nWould you like to book an appointment, or would you prefer we reach out to you?",
                "card": {
                    "type": "options",
                    "options": ["Book now", "Reach out to me later"]
                }
            }
        
        elif tool == "check_availability":
            # TODO: Google Calendar MCP
            return {"text": "Availability checking is coming soon. Our team can help you book directly — would you like us to reach out?", "card": None}

        elif tool == "book_visit":
            booking_phrases = ["book", "schedule", "appointment"]
            if any(p in user_message.lower() for p in booking_phrases):
                return {"text": "Online booking is coming soon. Our team can help you book directly — would you like us to reach out?", "card": {"type": "options", "options": ["Reach out to me later"]}}
            else:
                session["awaiting_lead"] = "name"
                return {"text": "Sure! Can I get your name?", "card": None}

        reach_out_phrases = ["reach out", "later", "call me", "contact me", "yes"]
        if any(p in user_message.lower() for p in reach_out_phrases):
            session["awaiting_lead"] = "name"
            return {"text": "Sure! Can I get your name?", "card": None}

        return {"text": "I'm not sure how to help with that. Can I answer any questions about our services?", "card": None}


    elif intent == "clarify":
        closing_phrases = ["no", "no thank", "no thanks", "that's all", "nothing else", "goodbye", "bye", "all good", "i'm good", "im good"]
        if any(p in user_message.lower() for p in closing_phrases):
            return {"text": "You're welcome! Feel free to reach out anytime. Have a great day! 🌿", "card": None}

        if not session.get("service"):
            return {"text": "What service are you looking for?", "card": {"type": "options", "options": ["Weekly mowing", "Biweekly mowing", "Spring cleanup", "Fall leaf removal"]}}
        
        if not session.get("yard_size"):
            return {"text": "What is your yard size?", "card": {"type": "options", "options": ["Small (up to ¼ acre)", "Medium (¼ to ½ acre)", "Large (over ½ acre)"]}}
        
        return {"text": "Could you give me a bit more detail? I want to make sure I point you in the right direction.", "card": None}


    elif intent == "escalate":
        summary_response = client.chat.completions.create(
            model = GENERATOR_MODEL,
            messages = [
                {"role": "system", "content": "Summarize this conversation in 3-4 sentences for a human agent."},
                {"role": "user", "content": str(chat_history)}
            ]
        )

        chat_summary = summary_response.choices[0].message.content

        create_handoff(
            name = session.get("name", "Unknown"),
            phone = session.get("phone", "Unknown"),
            email = session.get("email"),
            reason = session.get("reason", user_message),
            chat_summary = chat_summary
        )

        return {"text": "I'm sorry to hear that. Let me connect you with our team right away.", "card": {"type": "handoff"}}
   