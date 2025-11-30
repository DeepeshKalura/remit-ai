from crewai import Agent, Task, Crew, Process
from src.tools.agent_tools import RemitTools
from src.core.llm_factory import LLMFactory
from src.services.user_service import UserService
from src.services.context_service import ContextService
from typing import Union, AsyncGenerator

class RemitAgentManager:
    def __init__(self):
        self.llm = LLMFactory.create_llm()
        self.user_service = UserService()
        self.context_service = ContextService()

    async def chat(self, user_message: str, context: Union[dict, None] = None) -> AsyncGenerator[str, None]:
        context = context or {}
        conversation_id = context.get("conversation_id", "default")
        current_user_id = context.get("user_id", 99)

        self.context_service.add_message(conversation_id, "user", user_message)

        # --- 1️⃣ ROUTING AGENT ---
        router = Agent(
            role="Intent Router",
            goal='Decide if user intent is "rate_inquiry" or "transaction_plan" ONLY.',
            backstory="You analyze user intent and pick one of two possible categories.",
            llm=self.llm,
        )

        route_task = Task(
            description=f"Classify this message: '{user_message}' into 'rate_inquiry' or 'transaction_plan'. Output only one of these two strings.",
            expected_output="Either 'rate_inquiry' or 'transaction_plan'",
            agent=router,
        )

        route_crew = Crew(
            agents=[router],
            tasks=[route_task],
            process=Process.sequential,
        )

        routing_decision = str(route_crew.kickoff()).strip().lower()
        if "rate" in routing_decision:
            intent = "rate_inquiry"
        elif "transaction" in routing_decision or "plan" in routing_decision:
            intent = "transaction_plan"
        else:
            intent = "unknown"

        # --- 2️⃣ SPECIALIST AGENT ---
        if intent == "rate_inquiry":
            agent = Agent(
                role="Rate Inquiry Specialist",
                goal="Answer user questions about crypto exchange rates using your tools.",
                backstory="You are a financial expert who provides accurate exchange rates.",
                tools=[RemitTools.get_ada_to_stable_rate, RemitTools.swap_ada_to_stable],
                llm=self.llm,
                verbose=True,
            )

            task = Task(
                description=f"The user asked: '{user_message}'. Use your tools to get a clear, concise rate answer.",
                expected_output="A helpful answer with the exchange rate.",
                agent=agent,
            )

        elif intent == "transaction_plan":
            agent = Agent(
                role="Transaction Planner",
                goal="Help the user prepare a remittance transaction.",
                backstory="You find recipients and calculate transaction quotes.",
                tools=[RemitTools.search_my_payees, RemitTools.swap_ada_to_stable],
                llm=self.llm,
                verbose=True,
            )

            task = Task(
                description=f"""The user said: '{user_message}'.
                1. Identify recipient (using Search My Payees tool with user_id={current_user_id}).
                2. Identify amount of ADA to send.
                3. Use Swap ADA to Stablecoin to get a quote.
                4. Summarize the transaction plan clearly.""",
                expected_output="Transaction plan summary or ask for missing amount.",
                agent=agent,
            )
        else:
            yield f"❌ Sorry, I couldn’t understand your intent. Got: '{routing_decision}'. Try again."
            return

        # --- 3️⃣ RUN THE SPECIALIST CREW STREAM ---
        specialist_crew = Crew(
            agents=[agent],
            tasks=[task],
            process=Process.sequential,
        )

        try:
            for chunk in specialist_crew.kickoff_stream():
                yield str(chunk)
        except Exception as e:
            result = specialist_crew.kickoff()
            yield str(result)

        self.context_service.add_message(conversation_id, "assistant", "✅ Done.")
