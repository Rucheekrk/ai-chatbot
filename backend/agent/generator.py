import openai
from config import OPENAI_API_KEY, GENERATOR_MODEL
from rag.retriever import retrieve
# import tools mocks later


client = openai.OpenAI(api_key = OPENAI_API_KEY)

def generate(intent, confidence, user_message, chat_history, pii):
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
        pass

    elif intent == "clarify":
        return {"text": "Could you give me a bit more detail? I want to make sure I point you in the right direction.", "card": None}


    elif intent == "escalate":
        return {"text": "I'm sorry to hear that. Let me connect you with our team right away.", "card": {"type": "handoff"}}