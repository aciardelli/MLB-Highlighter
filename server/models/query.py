from pydantic import BaseModel
from models.savant_filters import SavantFilters

class Query(BaseModel):
    query: str

class QueryResponse(BaseModel):
    filters: SavantFilters
    url: str
