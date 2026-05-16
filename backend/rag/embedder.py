import openai
from config import EMBED_MODEL, OPENAI_API_KEY

client = openai.OpenAI(api_key = OPENAI_API_KEY)

def embed(text):
    model = EMBED_MODEL
    response = client.embeddings.create(
        input = text,
        model = model
    )

    return response.data[0].embedding
