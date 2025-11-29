from crewai import Agent, Task, Crew, Process
from src.core.llm_factory import LLMFactory
from src.tools.agent_tools import RemitTools

class RemitAgentManager:
    def __init__(self):
        self.llm = LLMFactory.create_llm()
        
    def chat(self, user_message: str, context: dict = None) -> str:
        """
        Run a single-turn agent execution based on user message.
        """
        # 1. Define Agent
        assistant = Agent(
            role='Remittance Assistant',
            goal='Help users send money, check rates, and find recipients efficiently.',
            backstory="""You are an expert AI assistant for RemitAI. 
            You have access to real-time tools to check rates, find users, and prepare quotes.
            Always use your tools when a user asks for facts (rates, users).
            Be concise and helpful.""",
            tools=[
                RemitTools.search_users, 
                RemitTools.get_exchange_rate, 
                RemitTools.create_quote
            ],
            llm=self.llm,
            verbose=True
        )

        # 2. Define Task
        task = Task(
            description=f"User says: '{user_message}'. \nContext: {context or {}}. \nAnswer the user request using tools if necessary.",
            expected_output="A helpful text response to the user.",
            agent=assistant
        )

        # 3. Execute Crew
        crew = Crew(
            agents=[assistant],
            tasks=[task],
            process=Process.sequential
        )

        result = crew.kickoff()
        return str(result)