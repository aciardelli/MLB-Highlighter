from pydantic_ai import Agent
from custom_models import SavantFilters, Query, QueryResponse
from utils.helpers import open_md_file, construct_url
from dotenv import load_dotenv

load_dotenv()

mappings_md = open_md_file('mappings.md')
examples_md = open_md_file('examples.md')

class SavantQuery():

    def __init__(self):
        self.query_agent = Agent(
            'openai:gpt-4o-mini',
            output_type=SavantFilters,
            system_prompt=f"""You are a baseball data agent for Baseball Savant queries.

            Process natural language queries into the correct filters.
            Only use values from the mappings provided.

            Mappings: {mappings_md}

            Examples: {examples_md}

            Important: Only fill filters that are necessary and use exact mapped values.
            """
        )

    async def process_query(self, query: Query):
        response = await self.query_agent.run(f"Here is your query: {query.query}")
        url = construct_url(response.output)
        return QueryResponse(
            filters = response.output,
            url = url
        )


