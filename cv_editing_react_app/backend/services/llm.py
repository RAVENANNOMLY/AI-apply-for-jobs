from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
import json
import re

import time
from services.database.db_schema import LLM_Eval
from services.database.db import add_llm_eval

def parse_llm_json(text: str) -> dict:
    text = text.strip()

    # Remove markdown code fence
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    return json.loads(text)

env_path = ".env"
load_dotenv(dotenv_path=env_path, override=True)

MODEL_NAME = os.getenv("MODEL_NAME")
HOST_ADDRESS = os.getenv("HOST_ADDRESS")

class LLM_With_Tracking:
    def __init__(self, model_name=MODEL_NAME, temperature=0, reasoning=False, task_name=None, base_url=HOST_ADDRESS):
        if model_name == 'GEMINI':
            self.llm = ChatGoogleGenerativeAI(
                                                model="gemini-3.5-flash-lite",
                                                temperature=temperature,  # Gemini 3.0+ defaults to 1.0
                                                thinking_level="minimal",
                                                include_thoughts=True,
                                                # other params...
                                            )
        else:
            self.llm = ChatOllama(
                                    model=model_name,
                                    temperature=temperature,
                                    reasoning=reasoning,
                                    keep_alive='20m',
                                    base_url=base_url,
                                    # other params...
                                )
        self.task_name = task_name or "unknown"
        self.model_name = model_name
        self.temperature = temperature

    def invoke_with_tracking(self, messages, pydantic_model=None):
        start_time = time.time()
        raw_output = None
        structured_output = None
        error_message = None
        num_input_tokens = 0
        num_output_tokens = 0
        num_total_tokens = 0

        try:
            response = self.llm.invoke(messages)
            raw_output = response.content[0]['text'] if self.model_name == 'GEMINI' else response.content
            elapsed = time.time() - start_time

            usage = getattr(response, "usage_metadata", {}) or {}
            num_input_tokens = usage.get("input_tokens", 0)
            num_output_tokens = usage.get("output_tokens", 0)
            num_total_tokens = num_input_tokens + num_output_tokens

            if pydantic_model is not None and getattr(response, "content", None) is not None:
                if self.model_name == 'GEMINI':
                    response_text = parse_llm_json(response.content[0]['text'])
                    structured_output = pydantic_model.model_validate(response_text)
                else:
                    structured_output = pydantic_model.model_validate_json(response.content)

        except Exception as e:
            error_message = str(e)
            elapsed = time.time() - start_time

        result = {
            "model_name": self.model_name,
            "structured_output": structured_output,
            "raw_output": raw_output,
            "task_name": self.task_name,
            "time_taken": round(elapsed, 3),
            "input_tokens": num_input_tokens,
            "output_tokens": num_output_tokens,
            "total_tokens": num_total_tokens,
            "error": error_message,
            "temperature": self.temperature,
        }

        eval_entry = LLM_Eval(
            model_name=result["model_name"],
            temperature=result["temperature"],
            task_name=result["task_name"],
            raw_output=result["raw_output"],
            time_taken=result["time_taken"],
            input_tokens=result["input_tokens"],
            output_tokens=result["output_tokens"],
            total_tokens=result["total_tokens"],
            error=result["error"]
        )

        add_llm_eval(eval_entry)

        return result

if __name__ == "__main__":
    from pydantic import BaseModel, Field



    class Movie(BaseModel):
        """A movie with details."""
        title: str = Field(description="The title of the movie")
        year: int = Field(description="The year the movie was released")
        director: str = Field(description="The director of the movie")
        rating: float = Field(description="The movie's rating out of 10")

    prompt = f'''Provide details about the movie Inception

        Return ONLY a JSON object.
        Do NOT return the schema.
        The JSON object must conform to this JSON Schema:
        {get_simple_schema(Movie)}
        '''
    # print(prompt)
    llm_tracker = LLM_With_Tracking(model_name=MODEL_NAME,temperature=0.2, task_name="movie_details")

    messages = [
        ("system","You are a helpful assistant."),
        ("human", prompt),
    ]


    output = llm_tracker.invoke_with_tracking(messages,pydantic_model=Movie)

    print(output)