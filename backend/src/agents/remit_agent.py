from crewai import Agent, Task, Crew, Process
from src.core.llm_factory import LLMFactory
from src.tools.agent_tools import RemitTools
from src.services.user_service import UserService
from src.services.context_service import ContextService

class RemitAgentManager:
    def __init__(self):
        self.llm = LLMFactory.create_llm()
        self.user_service = UserService()
        self.context_service = ContextService()
        
    def chat(self, user_message: str, context: dict = None) -> str:
        # 1. Extract IDs
        conversation_id = context.get("conversation_id", "default")
        current_user_id = context.get("user_id", 99) # Default to our mock "Sender"

        self.context_service.add_message(conversation_id, "user", user_message)

        chat_history = self.context_service.get_history(conversation_id)
        
        relations = self.user_service.get_user_relationships(current_user_id)
        relations_str = f"KNOWN RELATIONSHIPS: {relations}" if relations else ""

        assistant = Agent(
            role='Remittance Assistant',
            goal='Help users send money, check rates, and find recipients efficiently.',
            backstory=f"""You are an expert AI assistant for RemitAI. 
            
            CONTEXT AWARENESS:
            {relations_str}
            
            {chat_history}
            
            INSTRUCTIONS:
            - If the user says "sister", check KNOWN RELATIONSHIPS to find the name (e.g., Dipisha).
            - Use the 'Search Users' tool with the real name if found.
            - Remember previous details from CHAT HISTORY.
            """,
            tools=[RemitTools.search_users, RemitTools.swap_ada_to_stable, RemitTools.get_ada_to_stable_rate],
            llm=self.llm,
            verbose=True,

        )

        # 5. Define Task
        task = Task(
            description=f"User says: '{user_message}'. Answer based on context and tools.",
            expected_output="A helpful text response.",
            agent=assistant
        )

        crew = Crew(agents=[assistant], tasks=[task], process=Process.sequential, )
        result = crew.kickoff()
        
        # 6. Persist AI Response
        self.context_service.add_message(conversation_id, "assistant", str(result))
        
        return str(result)