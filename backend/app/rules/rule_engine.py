import json
import os
from typing import Dict, Any, List, Tuple
from datetime import date


SUPPORTED_AGE_GROUPS = [2, 4, 6, 9, 12, 18, 24, 36, 48, 60]

# Parent-friendly everyday domain labels
DOMAIN_NAMES = {
    "gross_motor": "Physical Movement",
    "fine_motor": "Hand & Finger Skills",
    "language": "Talking & Speech",
    "cognitive": "Thinking & Learning",
    "social_emotional": "Social & Feelings",
}

DOMAIN_SUBTITLES = {
    "gross_motor": "Running, hopping, balancing, crawling",
    "fine_motor": "Drawing, holding objects, building towers",
    "language": "Making sounds, saying words, listening",
    "cognitive": "Exploring, solving puzzles, counting",
    "social_emotional": "Smiling, sharing, expressing feelings",
}


def load_milestone_dataset() -> Dict[str, Any]:
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "data", "milestone_questions.json")
    with open(dataset_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_matching_age_group(age_months: float) -> int:
    if age_months < 2:
        return 2
    
    matched = 2
    for age_bracket in SUPPORTED_AGE_GROUPS:
        if age_months >= age_bracket:
            matched = age_bracket
        else:
            break
    return matched


def get_questions_for_age(age_months: float) -> Tuple[int, List[Dict[str, Any]]]:
    dataset = load_milestone_dataset()
    age_group = get_matching_age_group(age_months)
    questions = dataset["questions"].get(str(age_group), [])
    return age_group, questions


def calculate_age_months(date_of_birth: date, ref_date: date = None) -> int:
    if ref_date is None:
        ref_date = date.today()
    diff_days = (ref_date - date_of_birth).days
    return max(0, int(diff_days / 30.4375))


def evaluate_milestone_assessment(
    child_dob: date,
    assessment_date: date,
    responses: List[Dict[str, str]],
    latest_growth: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """
    Parent-Friendly Rule-Based Engine:
    - Calculates friendly domain scores.
    - Determines reassuring parent status labels:
        - 🌟 Growing Great!
        - 🌱 Developing Well (Keep Observing)
        - ❤️ Needs Extra Support
        - 📝 Incomplete
    - Generates actionable, fun home play ideas.
    """
    age_months = calculate_age_months(child_dob, assessment_date)
    age_group, questions = get_questions_for_age(age_months)
    
    questions_by_id = {q["id"]: q for q in questions}
    total_questions = len(questions)
    
    responses_map = {r["question_id"]: r["answer"].lower() for r in responses}
    
    domain_totals = {d: 0 for d in DOMAIN_NAMES.keys()}
    domain_achieved = {d: 0 for d in DOMAIN_NAMES.keys()}
    domain_not_observed = {d: 0 for d in DOMAIN_NAMES.keys()}
    domain_unsure = {d: 0 for d in DOMAIN_NAMES.keys()}

    not_observed_count = 0
    unsure_count = 0
    answered_count = 0

    play_ideas = []
    doctor_notes = []

    for q in questions:
        q_id = q["id"]
        domain = q["domain"]
        domain_totals[domain] = domain_totals.get(domain, 0) + 1
        
        answer = responses_map.get(q_id)
        if answer:
            answered_count += 1
            if answer == "achieved":
                domain_achieved[domain] = domain_achieved.get(domain, 0) + 1
            elif answer == "not_yet_observed":
                domain_not_observed[domain] = domain_not_observed.get(domain, 0) + 1
                not_observed_count += 1
                if q.get("play_idea"):
                    play_ideas.append(f"• [{DOMAIN_NAMES.get(domain, domain)}]: {q['play_idea']}")
                doctor_notes.append(f"{DOMAIN_NAMES.get(domain, domain)}: '{q['text']}' is not yet observed.")
            elif answer == "unsure":
                domain_unsure[domain] = domain_unsure.get(domain, 0) + 1
                unsure_count += 1

    completion_ratio = round(answered_count / total_questions, 2) if total_questions > 0 else 0.0

    domain_scores = {}
    domain_breakdown = []

    for domain_key, domain_title in DOMAIN_NAMES.items():
        total_d = domain_totals[domain_key]
        achieved_d = domain_achieved[domain_key]
        not_obs_d = domain_not_observed[domain_key]
        unsure_d = domain_unsure[domain_key]
        
        score_pct = round((achieved_d / total_d * 100), 1) if total_d > 0 else 0.0
        domain_scores[domain_key] = score_pct
        
        domain_breakdown.append({
            "domain": domain_key,
            "domain_name": domain_title,
            "domain_subtitle": DOMAIN_SUBTITLES.get(domain_key, ""),
            "score": score_pct,
            "total_questions": total_d,
            "achieved_count": achieved_d,
            "not_observed_count": not_obs_d,
            "unsure_count": unsure_d
        })

    # Evaluate friendly status
    growth_concern = False
    if latest_growth:
        bmi = latest_growth.get("bmi")
        if bmi and (bmi < 12.0 or bmi > 22.0):
            growth_concern = True
            play_ideas.append("• [Physical Growth]: Latest growth record shows unusual height/weight measurements. Double check measurements at home.")

    if completion_ratio < 0.7:
        status = "Incomplete"
        overall_summary = "Please answer all questions to see a complete development summary for your child."
    elif min(domain_scores.values()) < 60.0 or not_observed_count >= 3 or growth_concern:
        status = "Additional Monitoring Recommended"  # Map internally to Needs Extra Support
        overall_summary = "Your child is making progress! A few age milestones are developing at their own pace. Great to discuss these observations during your next routine doctor checkup."
    elif min(domain_scores.values()) < 80.0 or not_observed_count == 2 or unsure_count >= 3:
        status = "Routine Monitoring"  # Map internally to Developing Well
        overall_summary = "Your child is developing well! Keep up the daily play and positive interaction. A couple of milestones are still emerging."
    else:
        status = "On Track"  # Map internally to Growing Great!
        overall_summary = "🌟 Wonderful news! Your child is meeting age-appropriate developmental milestones consistently across all monitored areas."

    full_guidance = [overall_summary] + play_ideas

    return {
        "age_months": age_months,
        "age_group": age_group,
        "gross_motor_score": domain_scores.get("gross_motor", 0.0),
        "fine_motor_score": domain_scores.get("fine_motor", 0.0),
        "language_score": domain_scores.get("language", 0.0),
        "cognitive_score": domain_scores.get("cognitive", 0.0),
        "social_emotional_score": domain_scores.get("social_emotional", 0.0),
        "not_observed_count": not_observed_count,
        "unsure_count": unsure_count,
        "completion_ratio": completion_ratio,
        "status": status,
        "guidance": full_guidance,
        "doctor_notes": doctor_notes,
        "domain_breakdown": domain_breakdown,
        "responses_map": responses_map
    }
