def calculate_risk_exposure(risks: list) -> dict:
    try:
        weights = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 5}
        total_risk_score = 0

        if not risks:
            return {"score": 0, "schedule_penalty_multiplier": 1.0, "cost_penalty_multiplier": 1.0}

        active_risks = [r for r in risks if getattr(r, 'status', 'OPEN') in ["OPEN", "IN_PROGRESS"]]

        for r in active_risks:
            probability = weights.get(str(getattr(r, 'probability', 'MEDIUM')).upper(), 2)
            impact = weights.get(str(getattr(r, 'impact', 'MEDIUM')).upper(), 2)
            total_risk_score += (probability * impact)

        penalty_multiplier = 1.0 + ((total_risk_score / 10) * 0.05)
        penalty_multiplier = min(penalty_multiplier, 2.5) 
        
        return {
            "score": total_risk_score,
            "schedule_penalty_multiplier": penalty_multiplier,
            "cost_penalty_multiplier": penalty_multiplier
        }
    except Exception:
        return {"score": 0, "schedule_penalty_multiplier": 1.0, "cost_penalty_multiplier": 1.0}