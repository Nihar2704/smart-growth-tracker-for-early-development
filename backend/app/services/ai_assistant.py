import os
import json
import logging
import requests
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("grow_sense_ai_assistant")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODELS = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-3.8-flash"
]

FALLBACK_DOMAIN_TIPS = {
    "gross_motor": [
        "Provide daily supervised tummy time or floor play to strengthen neck and core muscles.",
        "Encourage crawling or reaching by placing bright, favorite toys slightly out of reach.",
        "Practice assisted standing, cruising along soft furniture, or gentle kicking games."
    ],
    "fine_motor": [
        "Offer finger-foods (like soft fruit pieces) to encourage pincer grasp development.",
        "Engage in stacking soft blocks, transferring small objects between containers, or page turning.",
        "Use safe scribbling with large non-toxic crayons or finger painting."
    ],
    "language": [
        "Narrate everyday routines out loud and respond enthusiastically to all babbling/sounds.",
        "Read picture books together daily, pointing to animals and objects while naming them.",
        "Sing nursery rhymes with repetitive sounds and pause to let your child try to chime in."
    ],
    "cognitive": [
        "Play interactive peek-a-boo or hide-and-seek with toys under light cloths.",
        "Introduce simple shape sorters, nesting cups, or cause-and-effect toys (buttons, musical bells).",
        "Encourage exploration of different textures like soft fabrics, crinkly paper, and smooth wooden blocks."
    ],
    "social_emotional": [
        "Practice mirror play so your child can observe their own smiles and facial expressions.",
        "Offer warm eye contact, smiles, and reciprocal vocal gestures during feeding and playtime.",
        "Help label emotions gently ('You are happy!' or 'You feel sleepy') to foster early emotional security."
    ]
}


def build_system_prompt(context: Optional[Dict[str, Any]]) -> str:
    child_info = []
    if context:
        if context.get("child_name"):
            child_info.append(f"Child Name: {context.get('child_name')}")
        if context.get("age_months") is not None:
            child_info.append(f"Age: {context.get('age_months')} months")
        if context.get("gender"):
            child_info.append(f"Sex: {context.get('gender')}")
        if context.get("current_domain"):
            child_info.append(f"Current Assessment Domain: {context.get('current_domain')}")
        if context.get("current_question"):
            child_info.append(f"Active Assessment Question: '{context.get('current_question')}'")
        if context.get("latest_scores"):
            child_info.append(f"Latest Domain Scores: {context.get('latest_scores')}")
        if context.get("status"):
            child_info.append(f"Screening Status: {context.get('status')}")

    context_str = "\n".join(child_info) if child_info else "No specific child profile selected."

    return (
        "You are GrowSense AI, an empathetic, certified pediatric developmental assistant for the Smart Growth Tracker application.\n"
        "Your role is to assist parents while they complete or review CDC (Centers for Disease Control & Prevention) developmental milestone assessments.\n\n"
        f"--- ACTIVE CONTEXT ---\n{context_str}\n----------------------\n\n"
        "GUIDELINES FOR YOUR RESPONSES:\n"
        "1. TONE: Warm, reassuring, evidence-based, and encouraging. Never panic parents.\n"
        "2. ACCESSIBILITY: Explain developmental concepts in simple, everyday language without complex medical jargon.\n"
        "3. ACTIONABLE ADVICE: Whenever relevant, suggest 1-2 fun, play-based at-home stimulation activities parents can try.\n"
        "4. RED FLAGS & GUIDANCE: Clearly explain what is a normal variation versus when to consult their pediatrician for an in-person evaluation.\n"
        "5. BREVITY: Keep your answer concise (under 180 words) and nicely formatted with bullet points or bold highlights.\n"
        "6. DISCLAIMER: Always provide supportive guidance, reminding parents that this is an educational screening aid and not a definitive clinical diagnosis."
    )


def generate_fallback_response(query: str, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Generates an expert, offline CDC-aligned answer when external LLM API is unavailable."""
    lower_q = query.lower()
    child_name = (context.get("child_name") if context else None) or "your child"
    age_months = (context.get("age_months") if context else None) or 12
    domain = (context.get("current_domain") if context else "") or ""
    domain_key = domain.lower().replace(" ", "_").replace("&_", "")

    tips = []
    for key, items in FALLBACK_DOMAIN_TIPS.items():
        if key in domain_key or key in lower_q:
            tips = items
            break
    if not tips:
        tips = FALLBACK_DOMAIN_TIPS.get("gross_motor", [])

    if "question" in lower_q or "explain" in lower_q or "mean" in lower_q:
        q_text = context.get("current_question") if context else "this milestone"
        reply = (
            f"**Milestone Clarification for {child_name} ({age_months}m)**:\n\n"
            f"Regarding *\"{q_text}\"*:\n"
            f"• **What to look for**: Watch whether your child attempts this behavior naturally during everyday play or interaction.\n"
            f"• **Partial progress**: If they perform it with slight support or sometimes, that demonstrates emerging development.\n"
            f"• **At-home activity**: Practice in short, playful 5-minute sessions without pressure.\n\n"
            f"*Tip: Every child develops at their own unique pace within standard CDC milestone windows!*"
        )
    elif "score" in lower_q or "result" in lower_q or "percent" in lower_q or "delay" in lower_q:
        reply = (
            f"**Understanding {child_name}'s Assessment Scores**:\n\n"
            f"• **Screening vs. Diagnosis**: Milestone percentage scores reflect current observed behaviors compared to CDC benchmark groups.\n"
            f"• **Suggested Home Stimulations**:\n"
            f"  - {tips[0]}\n"
            f"  - {tips[1]}\n"
            f"• **Next Step**: Track progress over the next 4–6 weeks. If a domain remains consistently low, share the 1-Click WhatsApp or PDF summary with your pediatrician."
        )
    else:
        reply = (
            f"**Pediatric Guidance for {child_name} ({age_months} months)**:\n\n"
            f"At this stage of development, children actively refine their physical coordination, curiosity, and communication.\n\n"
            f"**Recommended Playful Activities**:\n"
            f"• {tips[0]}\n"
            f"• {tips[1]}\n"
            f"• {tips[2]}\n\n"
            f"*Always consult your pediatrician if you notice a regression in previously learned skills or lack of eye contact.*"
        )

    suggestions = [
        f"How can I encourage speech at {age_months} months?",
        "What are normal milestone ranges?",
        "When should I speak with a pediatrician?"
    ]

    return {
        "reply": reply,
        "suggestions": suggestions,
        "model": "offline-cdc-expert-engine"
    }


def call_gemini_api(message: str, context: Optional[Dict[str, Any]], history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip() or GEMINI_API_KEY
    if not api_key:
        logger.warning("No GEMINI_API_KEY found. Using expert offline developmental engine.")
        return generate_fallback_response(message, context)

    system_instruction = build_system_prompt(context)

    # Format Gemini contents payload
    contents = []
    if history:
        for item in history[-6:]:  # Keep recent context window
            role = "user" if item.get("role") in ["user", "parent"] else "model"
            contents.append({
                "role": role,
                "parts": [{"text": item.get("content", "")}]
            })

    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })

    payload = {
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 450,
            "topP": 0.95
        }
    }

    # Attempt calls through prioritized models
    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            res = requests.post(url, json=payload, timeout=12)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        reply_text = parts[0]["text"].strip()
                        age_m = (context.get("age_months") if context else None) or 12
                        suggestions = [
                            f"How to support this milestone at {age_m} months?",
                            "What are the key CDC red flags?",
                            "Suggest fun learning games for today"
                        ]
                        return {
                            "reply": reply_text,
                            "suggestions": suggestions,
                            "model": model_name
                        }
            else:
                logger.warning(f"Gemini model {model_name} returned status {res.status_code}: {res.text[:120]}")
        except Exception as e:
            logger.error(f"Error calling model {model_name}: {str(e)}")

    # If all models failed or timed out, fall back cleanly
    logger.info("Falling back to local pediatric guidance engine.")
    return generate_fallback_response(message, context)
