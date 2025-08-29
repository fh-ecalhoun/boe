import os
from pinecone import Pinecone

# Load env vars
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_PROJECT = os.getenv("PINECONE_PROJECT_NAME")

print("🔍 Verifying Pinecone configuration...")
print("  🔑 API Key:", "✔️" if PINECONE_API_KEY else "❌ MISSING")
print("  🌐 Environment:", PINECONE_ENV or "❌ MISSING")
print("  🧱 Project Name:", PINECONE_PROJECT or "❌ MISSING")

# Check required values
if not PINECONE_API_KEY:
    print("❌ Missing required API key")
    exit(1)

# Create Pinecone client instance (new SDK pattern)
try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    print("✅ Pinecone client created.")
except Exception as e:
    print("❌ Error creating Pinecone client:", str(e))
    exit(1)

# Try listing indexes
try:
    indexes = pc.list_indexes().names()
    print("✅ Pinecone is connected. Indexes:", indexes)
except Exception as e:
    print("❌ Error connecting to Pinecone:", str(e))

