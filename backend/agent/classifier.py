import openai
from config import OPENAI_API_KEY, CLASSIFIER_MODEL, CONFIDENCE_CLARIFY, CONFIDENCE_ESCALATE

client = openai.OpenAI(api_key = OPENAI_API_KEY)

def intent_classify(text, chat_history=None):
    prompt = f"""You are an intent classifier for Sage, the AI assistant for Green Acres Lawn Care, a residential lawn care business in the Atlanta metro area.

    Your job is to read the user message and classify it into exactly one of four intents: rag, tool, clarify, or escalate.

    ---

    INTENT DEFINITIONS:

    1. rag
    The user is asking a question that can be answered from the business knowledge base. This includes questions about pricing, services offered, service area coverage, add-ons, or policies.

    Examples:
    User: "Do you service Sandy Springs?"
    intent: rag
    confidence: 0.97

    User: "What is included in the premium package?"
    intent: rag
    confidence: 0.94

    User: "Do you offer aeration services?"
    intent: rag
    confidence: 0.93

    User: "What is your cancellation policy?"
    intent: rag
    confidence: 0.91

    2. tool
    The user wants to take an action — book an appointment, check availability, or get a price estimate for their specific situation.

    3. clarify
    The user message is too vague, incomplete, or ambiguous to determine what they need.

    Examples:
    User: "Help me"
    intent: clarify
    confidence: 0.95

    User: "I need something done"
    intent: clarify
    confidence: 0.92

    User: "Can you do it?"
    intent: clarify
    confidence: 0.93

    User: "Yes"
    intent: clarify
    confidence: 0.90

    User: "What about the other one?"
    intent: clarify
    confidence: 0.91

    4. escalate
    The user is frustrated, making a complaint, requesting a refund, reporting damage, or asking for something beyond what the chatbot can handle. A human needs to take over.

    Examples:
    User: "Your team damaged my lawn, I want to speak to someone"
    intent: escalate
    confidence: 0.97

    User: "This is unacceptable, I want a refund"
    intent: escalate
    confidence: 0.96

    User: "I need to file a complaint"
    intent: escalate
    confidence: 0.95

    User: "Your team didn't show up and I took a day off work"
    intent: escalate
    confidence: 0.97

    User: "I want to talk to a manager"
    intent: escalate
    confidence: 0.96

    ---

    TOOL SELECTION:

    If intent is tool, also return a third line:
    tool: <price_estimator|check_availability|book_visit|none>

    If intent is not tool, return:
    tool: none

    Examples:

    User: "I want to book a lawn mow for next Saturday"
    intent: tool
    confidence: 0.96
    tool: book_visit

    User: "Can you book me in for Friday at 10am?"
    intent: tool
    confidence: 0.97
    tool: book_visit

    User: "I'll take the premium package, book me in"
    intent: tool
    confidence: 0.94
    tool: book_visit

    User: "Reach out to me later"
    intent: tool
    confidence: 0.95
    tool: book_visit

    User: "Please have someone call me"
    intent: tool
    confidence: 0.93
    tool: book_visit

    User: "Yes, please reach out"
    intent: tool
    confidence: 0.94
    tool: book_visit

    User: "Is tomorrow morning available?"
    intent: tool
    confidence: 0.95
    tool: check_availability

    User: "Do you have any slots open this weekend?"
    intent: tool
    confidence: 0.93
    tool: check_availability

    User: "What times are available next week?"
    intent: tool
    confidence: 0.92
    tool: check_availability

    User: "I have a large yard, how much would it cost?"
    intent: tool
    confidence: 0.92
    tool: price_estimator

    User: "Can you give me a price estimate for my property?"
    intent: tool
    confidence: 0.91
    tool: price_estimator

    User: "How much would it be for a corner lot with a backyard?"
    intent: tool
    confidence: 0.93
    tool: price_estimator

    User: "How much does lawn mowing cost?"
    intent: tool
    confidence: 0.95
    tool: price_estimator

    User: "What's the price for lawn care?"
    intent: tool
    confidence: 0.94
    tool: price_estimator

    User: "What does your service cost?"
    intent: tool
    confidence: 0.94
    tool: price_estimator

    ---

    OUTPUT FORMAT:
    Return exactly three lines, nothing else:
    intent: <rag|tool|clarify|escalate>
    confidence: <number between 0.0 and 1.0>
    tool: <price_estimator|check_availability|book_visit|none>

    Do not explain your reasoning. Do not add any other text."""

    context_section = ""
    if chat_history:
        recent = chat_history[-2:]
        lines = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in recent])
        context_section = f"""
    CONVERSATION CONTEXT (last exchange):
    {lines}

    Use this context to classify accurately. Example: if the assistant just offered "Book now" or "Reach out to me later" and the user replies with either, classify as tool / book_visit.

    ---
"""
        prompt = prompt.replace("    OUTPUT FORMAT:", context_section + "    OUTPUT FORMAT:")

    response = client.chat.completions.create(
        model = CLASSIFIER_MODEL,
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": text}
        ]
    )

    content = response.choices[0].message.content.strip().lower()
    lines = content.split("\n")

    intent = lines[0].split(": ")[1].strip()
    confidence = float(lines[1].split(": ")[1].strip())
    tool = lines[2].split(": ")[1].strip()

    if confidence < CONFIDENCE_ESCALATE: intent = "escalate"
    elif confidence < CONFIDENCE_CLARIFY: intent = "clarify"

    
    return {"intent": intent , "confidence": confidence, "tool": tool}
    