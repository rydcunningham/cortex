from api.routes import tag_taxonomy, extract_entities
from fastapi import FastAPI

app = FastAPI()

# Include the tag taxonomy router
app.include_router(tag_taxonomy.router)
app.include_router(extract_entities.router, prefix="/api") 