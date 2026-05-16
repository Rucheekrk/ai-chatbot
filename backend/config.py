import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

CLASSIFIER_MODEL = "gpt-4o-mini"
GENERATOR_MODEL = "gpt-4o-mini"
EMBED_MODEL = "text-embedding-3-small"

CONFIDENCE_CLARIFY = 0.70
CONFIDENCE_ESCALATE = 0.65
RAG_MIN_SCORE = 0.50
RAG_TOP_K = 3
