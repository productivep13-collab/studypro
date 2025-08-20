from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from sqlalchemy import create_engine, Column, String, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import List
from sqlalchemy import Text

DATABASE_URL = "postgresql://postgres:1234@localhost/studypro"

client = Groq(
    api_key="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",
)
# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database model
class Post(Base):
    __tablename__ = "posts"
    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String(100))
    studyMaterial = Column(Text)

# Drop and recreate the table to apply changes
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request body model
class BlurtRequest(BaseModel):
    value: dict  # {id, title, studyMaterial}
    answer: str  # User’s blurred answer

class createProject(BaseModel):
    id: int
    title: str
    studyMaterial: str

class PostResponse(BaseModel):
    id: int
    title: str
    studyMaterial: str

class FlashRequest(BaseModel):
    value: dict  # {id, title, studyMaterial}

@app.get("/projects", response_model=List[PostResponse])
def get_projects():
    db = SessionLocal()
    try:
        posts = db.query(Post).all()
        return posts
    finally:
        db.close()

@app.post("/createPro")
def create_project(project: createProject):
    db = SessionLocal()
    try:
        db_post = Post(id=project.id, title=project.title, studyMaterial=project.studyMaterial)
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        return db_post
    finally:
        db.close()

@app.post("/blurt")
def blurt_study_material(request: BlurtRequest):
    study_text = request.value.get("studyMaterial", "")
    user_answer = request.answer

    if not study_text:
        return {
            "accuracy": "0%",
            "correct_words": [],
            "wrong_words": [],
            "missed_points": [],
            "revise_again": ["No study material provided."]
        }

    response = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {"role": "system", "content": "Return ONLY JSON. No explanations, no markdown, no text outside JSON."},
            {
                "role": "user",
                "content": f"""
Compare the student's answer with the study material.

Study Material: {study_text}
User Answer: {user_answer}

Return JSON in this format only:
{{
  "accuracy": "85%",
  "correct_words": ["word1", "word2"],
  "wrong_words": ["word3"],
  "missed_points": ["point1"],
  "revise_again": ["part1"]
}}
"""
            }
        ],
        temperature=0.2,
        max_tokens=512
    )

    import json, re
    ai_response = response.choices[0].message.content.strip()

    try:
        # Extract JSON only
        match = re.search(r"\{.*\}", ai_response, re.DOTALL)
        if match:
            ai_response = match.group(0)
        result = json.loads(ai_response)
    except Exception as e:
        result = {
            "accuracy": "0%",
            "correct_words": [],
            "wrong_words": [],
            "missed_points": [],
            "revise_again": [f"Parsing error: {str(e)}. Raw: {ai_response}"]
        }

    return {"result": result}


# Updated backend for flashcards
@app.post("/flashcards")
def flash_study_material(request: FlashRequest):
    study_text = request.value.get("studyMaterial", "")
    if not study_text:
        return {"result": {"flashcards": []}}

    response = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {"role": "system", "content": "Return ONLY JSON. No explanations, no markdown, no text outside JSON."},
            {
                "role": "user",
                "content": f"Generate flashcards as question and answer pairs for this material: {study_text}\n\nReturn JSON in this format only: {{\"flashcards\": [{{\"question\": \"...\", \"answer\": \"...\"}}, ...]}}"
            }
        ],
        temperature=0.5,
        max_tokens=1024
    )

    import json, re
    ai_response = response.choices[0].message.content.strip()

    try:
        match = re.search(r"\{.*\}", ai_response, re.DOTALL)
        if match:
            ai_response = match.group(0)
        result = json.loads(ai_response)
    except Exception as e:
        result = {"flashcards": []}

    return {"result": result}

# Add this updated endpoint to your existing FastAPI app

@app.post("/mnemonics")
def generate_mnemonics(request: FlashRequest):
    study_text = request.value.get("studyMaterial", "")
    title = request.value.get("title", "Study Material")
    
    if not study_text:
        return {"result": {"sections": []}}

    response = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {"role": "system", "content": "Return ONLY JSON. No explanations, no markdown, no text outside JSON."},
            {
                "role": "user",
                "content": f"""
Transform this study material into memorable, chunked content with mnemonics. Break it into logical sections with headings, then create digestible points with hover explanations and emojis.

Study Material: {study_text}
Title: {title}

For each section:
1. Create a clear heading with relevant emoji
2. Break content into small, memorable points
3. Add hover explanations for difficult terms
4. Create acronyms where helpful (like Q-FITC for quantum physics branches)
5. Add relevant emojis to aid memory

Return JSON in this exact format:
{{
  "sections": [
    {{
      "heading": "Main Topic Name",
      "headingEmoji": "🧬",
      "points": [
        {{
          "chunks": [
            {{"type": "normal", "text": "Regular text "}},
            {{"type": "hover", "text": "complex term", "explanation": "Simple explanation"}},
            {{"type": "normal", "text": " more text "}},
            {{"type": "acronym", "text": "ABC", "fullForm": "A-B-C full forms"}}
          ],
          "emoji": "⚡"
        }}
      ]
    }}
  ]
}}

Focus on:
- Making complex terms hoverable with simple explanations
- Creating memorable acronyms for lists
- Using emojis that relate to the content
- Breaking long sentences into digestible chunks
- Maintaining the original meaning while making it more memorable
"""
            }
        ],
        temperature=0.3,
        max_tokens=10000
    )

    import json, re
    ai_response = response.choices[0].message.content.strip()

    try:
        # Extract JSON only
        match = re.search(r"\{.*\}", ai_response, re.DOTALL)
        if match:
            ai_response = match.group(0)
        result = json.loads(ai_response)
        
        # Validate the structure
        if "sections" not in result:
            raise ValueError("Invalid response structure")
            
        # Ensure all sections have required fields
        for section in result["sections"]:
            if "heading" not in section:
                section["heading"] = "Study Section"
            if "headingEmoji" not in section:
                section["headingEmoji"] = "📚"
            if "points" not in section:
                section["points"] = []
                
            # Ensure all points have proper structure
            for point in section["points"]:
                if "chunks" not in point:
                    point["chunks"] = [{"type": "normal", "text": "Content not available"}]
                if "emoji" not in point:
                    point["emoji"] = ""
                    
                # Validate chunks
                for chunk in point["chunks"]:
                    if "type" not in chunk:
                        chunk["type"] = "normal"
                    if "text" not in chunk:
                        chunk["text"] = ""
                    
                    # Add explanation/fullForm if missing for special types
                    if chunk["type"] == "hover" and "explanation" not in chunk:
                        chunk["explanation"] = "No explanation available"
                    if chunk["type"] == "acronym" and "fullForm" not in chunk:
                        chunk["fullForm"] = "Full form not available"
        
    except Exception as e:
        # Fallback response if AI parsing fails
        result = {
            "sections": [
                {
                    "heading": title,
                    "headingEmoji": "📚",
                    "points": [
                        {
                            "chunks": [
                                {"type": "normal", "text": f"Processing error occurred. Raw content: {study_text[:200]}..."}
                            ],
                            "emoji": "⚠️"
                        }
                    ]
                }
            ]
        }

    return {"result": result}