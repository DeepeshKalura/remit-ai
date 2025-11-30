from crewai import Agent, Task, Crew, Process
from crewai.tasks.task_output import TaskOutput
from langchain_core.agents import AgentFinish
from src.core.llm_factory import LLMFactory
from src.tools.agent_tools import RemitTools
from src.services.user_service import UserService
from src.services.context_service import ContextService
from typing import Union

class RemitAgentManager:
    def __init__(self):
        self.llm = LLMFactory.create_llm()
        self.user_service = UserService()
        self.context_service = ContextService()
        
    def chat(self, user_message: str, context: Union[dict, None] = None):
        if context is None:
            context = {}
            
        conversation_id = context.get("conversation_id", "default")
        current_user_id = context.get("user_id", 99)

        self.context_service.add_message(conversation_id, "user", user_message)

        # AGENTS (moved here for easier access in this new flow)
        routing_agent = Agent(
            role='Intent Router',
            goal='Strictly categorize the user query as "rate_inquiry" or "transaction_plan" ONLY, and delegate to the correct specialist agent. Your output MUST be one of these two exact strings.',
            backstory='You are a master at understanding user intent. You analyze incoming queries and route them to the appropriate department without fail.',
            llm=self.llm,
            verbose=False
        )

        rate_inquiry_agent = Agent(
            role='Rate Inquiry Specialist',
            goal='Answer user questions about cryptocurrency exchange rates using the provided tools.',
            backstory='You are a financial expert who provides accurate, real-time exchange rates. You only answer questions about rates.',
            tools=[RemitTools.get_ada_to_stable_rate, RemitTools.swap_ada_to_stable],
            llm=self.llm,
            verbose=True
        )

        transaction_planner_agent = Agent(
            role='Transaction Planner',
            goal='Help users prepare a remittance transaction by finding the recipient and getting a quote for the specified amount.',
            backstory='You are a helpful assistant that guides users through the process of sending money. You find their contacts and calculate the transaction details.',
            tools=[RemitTools.search_my_payees, RemitTools.swap_ada_to_stable],
            llm=self.llm,
            verbose=True
        )

        # Routing Task
        routing_task = Task(
            description=f"""Analyze the user's message: '{user_message}'.
            Based on the content, output ONLY the primary intent as a single, exact string: 'rate_inquiry' or 'transaction_plan'.
            - Use 'rate_inquiry' if the user is asking about cryptocurrency exchange rates or current prices (e.g., "what is the price of ADA?", "how much is 100 ADA?").
            - Use 'transaction_plan' if the user intends to send money to someone, mentions recipients, or asks for transaction details (e.g., "send to my sister", "pay my landlord").""",
            expected_output="A single string: 'rate_inquiry' or 'transaction_plan'.",
            agent=routing_agent,
        )

        # 1. Determine Intent using a dedicated routing crew
        routing_crew = Crew(
            agents=[routing_agent],
            tasks=[routing_task],
            process=Process.sequential,
            verbose=False # Keep routing quiet
        )
        routing_decision = str(routing_crew.kickoff()).strip().lower()
        
        specialist_task = None
        specialist_crew = None

        if "rate_inquiry" == routing_decision:
            specialist_task = Task(
                description=f"The user asked: '{user_message}'. Use your tools to find the exchange rate and provide a clear answer.",
                expected_output="A concise, helpful response with the exchange rate.",
                agent=rate_inquiry_agent
            )
            specialist_crew = Crew(
                agents=[rate_inquiry_agent],
                tasks=[specialist_task],
                process=Process.sequential,
                verbose=True # Stream specialist verbose output
            )
        elif "transaction_plan" == routing_decision:
            specialist_task = Task(
                description=f"""The user wants to send money. Their message is: '{user_message}'.
                The current user's ID is {current_user_id}.
                
                Your step-by-step journey:
                1.  First, you MUST identify the recipient. Use the 'Search My Payees' tool. Your search query should be a term from the user's message (e.g., 'sister', 'landlord', 'Dipisha'). You must also pass the user_id: {current_user_id}.
                2.  Next, identify the amount of ADA to send from the message.
                3.  Then, use the 'Swap ADA to Stablecoin' tool to get a quote for that amount.
                4.  Finally, combine all the information into a clear summary for the user. Mention the recipient's name, the amount they will receive, and the wallet address.
                
                If the amount is missing from the user's message, you MUST ask for it. Do not proceed with the swap tool without an amount.
                """,
                expected_output="A summary of the transaction plan or a question asking for a missing amount.",
                agent=transaction_planner_agent,
            )
            specialist_crew = Crew(
                agents=[transaction_planner_agent],
                tasks=[specialist_task],
                process=Process.sequential,
                verbose=True # Stream specialist verbose output
            )
        else:
            # Handle unexpected output from the router agent
            error_message = f"Failed to classify your request. The router agent returned an unexpected classification: '{routing_decision}'. Please rephrase your query."
            self.context_service.add_message(conversation_id, "assistant", error_message)
            yield error_message
            return

        full_response = []
        try:
            for chunk in specialist_crew.kickoff_stream():
                yield str(chunk)
                full_response.append(str(chunk))
        except AttributeError:
            result = specialist_crew.kickoff()
            response_str = str(result)
            yield response_str
            full_response.append(response_str)

        self.context_service.add_message(conversation_id, "assistant", "".join(full_response))