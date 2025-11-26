# backend/main.py
import os
import json
import re
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from sqlalchemy import create_engine, Column, String, BigInteger, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = os.getenv("DATABASE_URL")  # set this on Render
GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # set this on Render (your Groq key)

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None
Base = declarative_base()

#models
class Post(Base):
    __tablename__ = "posts"
    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String(100))
    studyMaterial = Column(Text)

#main app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    if not engine:
        print("No DATABASE_URL set — running without DB")
        return
    try:
        # Create tables if they don't exist (safe for small projects)
        Base.metadata.create_all(bind=engine)
        # Simple connectivity test
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        print("DB connection OK and tables ensured")
    except SQLAlchemyError as e:
        # Log error but do not crash the whole app unless you want to
        print("DB init/connect failed:", e)

# ========== Request models ==========
class BlurtRequest(BaseModel):
    value: dict  # {id, title, studyMaterial}
    answer: str

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

#health endpoints
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/db-ping")
def db_ping():
    if not engine:
        return {"db": "not configured"}
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"db": "ok"}
    except Exception as e:
        return {"db": "error", "detail": str(e)}


@app.get("/projects", response_model=List[PostResponse])
def get_projects():
    if not SessionLocal:
        raise HTTPException(status_code=503, detail="Database not configured")
    db = SessionLocal()
    try:
        posts = db.query(Post).all()
        return posts
    finally:
        db.close()

@app.post("/createPro")
def create_project(project: createProject):
    if not SessionLocal:
        raise HTTPException(status_code=503, detail="Database not configured")
    db = SessionLocal()
    try:
        db_post = Post(id=project.id, title=project.title, studyMaterial=project.studyMaterial)
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        return db_post
    finally:
        db.close()

#safe ai call
def run_groq_completion(messages, temperature=0.3, max_tokens=512):
    if not client:
        raise HTTPException(status_code=503, detail="Groq API key not configured")
    response = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response


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

    try:
        response = run_groq_completion(
            [
                {"role": "system", "content": "Return ONLY JSON. No explanations, no markdown, no text outside JSON."},
                {"role": "user", "content": f"""Compare the student's answer with the study material.

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
"""}
            ],
            temperature=0.2,
            max_tokens=512
        )

        ai_response = response.choices[0].message.content.strip()
        match = re.search(r"\{.*\}", ai_response, re.DOTALL)
        ai_json = match.group(0) if match else ai_response
        result = json.loads(ai_json)
    except HTTPException as he:
        raise he
    except Exception as e:
        result = {
            "accuracy": "0%",
            "correct_words": [],
            "wrong_words": [],
            "missed_points": [],
            "revise_again": [f"Parsing error: {str(e)}. Raw: {ai_response if 'ai_response' in locals() else ''}"]
        }

    return {"result": result}

@app.post("/flashcards")
def flash_study_material(request: FlashRequest):
    study_text = request.value.get("studyMaterial", "")
    if not study_text:
        return {"result": {"flashcards": []}}

    try:
        response = run_groq_completion(
            [
                {"role": "system", "content": "Return ONLY JSON. No explanations, no markdown, no text outside JSON."},
                {"role": "user", "content": f"Generate flashcards as question and answer pairs for this material: {study_text}\n\nReturn JSON in this format only: {{\"flashcards\": [{{\"question\": \"...\", \"answer\": \"...\"}}, ...]}}"}
            ],
            temperature=0.5,
            max_tokens=1024
        )

        ai_response = response.choices[0].message.content.strip()
        match = re.search(r"\{.*\}", ai_response, re.DOTALL)
        ai_json = match.group(0) if match else ai_response
        result = json.loads(ai_json)
    except Exception:
        result = {"flashcards": []}

    return {"result": result}

@app.post("/mnemonics")
def generate_mnemonics(request: FlashRequest):
    study_text = request.value.get("studyMaterial", "")
    title = request.value.get("title", "Study Material")
    
    if not study_text:
        return {"result": {"sections": []}}

    try:
        response = run_groq_completion(
            [
                {"role": "system", "content": "Return ONLY JSON. No explanations, no markdown, no text outside JSON."},
                {"role": "user", "content": f"""Transform this study material into memorable, chunked content with mnemonics. Break it into logical sections with headings, then create digestible points with hover explanations and emojis.

Study Material: {study_text}
Title: {title}

For each section:
1. Create a clear heading with relevant emoji
2. Break content into small, memorable points
3. Add hover explanations for difficult terms
4. Create acronyms where helpful
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
"""}
            ],
            temperature=0.3,
            max_tokens=1200
        )

        ai_response = response.choices[0].message.content.strip()
        match = re.search(r"\{.*\}", ai_response, re.DOTALL)
        ai_json = match.group(0) if match else ai_response
        result = json.loads(ai_json)

        if "sections" not in result:
            raise ValueError("Invalid response structure")
        for section in result["sections"]:
            section.setdefault("heading", "Study Section")
            section.setdefault("headingEmoji", "📚")
            section.setdefault("points", [])
            for point in section["points"]:
                point.setdefault("chunks", [{"type":"normal","text":"Content not available"}])
                point.setdefault("emoji", "")
                for chunk in point["chunks"]:
                    chunk.setdefault("type", "normal")
                    chunk.setdefault("text", "")
                    if chunk["type"] == "hover":
                        chunk.setdefault("explanation", "No explanation available")
                    if chunk["type"] == "acronym":
                        chunk.setdefault("fullForm", "Full form not available")

    except Exception as e:
        result = {
            "sections": [
                {
                    "heading": title,
                    "headingEmoji": "📚",
                    "points": [
                        {
                            "chunks": [
                                {"type": "normal", "text": f"Processing error occurred. Raw content: {study_text[:200]}... Error: {str(e)}"}
                            ],
                            "emoji": "⚠️"
                        }
                    ]
                }
            ]
        }

    return {"result": result}
