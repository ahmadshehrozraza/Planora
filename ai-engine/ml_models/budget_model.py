from ml_models.risk_analyzer import calculate_risk_exposure

def predict_budget_risk(total_budget: float, tasks: list, risks: list, baseline_cost: float) -> dict:
    try:
        total_budget = float(total_budget) if total_budget is not None else 0.0
        baseline_cost = float(baseline_cost) if baseline_cost is not None else 0.0
    except ValueError:
        total_budget = 0.0
        baseline_cost = 0.0

    if total_budget <= 0:
         return {"status": "SAFE", "variance": 0, "projectedCost": 0}
         
    tasks_list = tasks if tasks else []
    total_spent = sum([getattr(t, 'budget', 0) for t in tasks_list if getattr(t, 'progress', 0) > 0])
    completed_tasks = len([t for t in tasks_list if getattr(t, 'progress', 0) == 100])
    total_task_count = len(tasks_list)
    
    risk_data = calculate_risk_exposure(risks)

    if completed_tasks == 0:
        projected_total = baseline_cost if baseline_cost > 0 else total_budget
        projected_total = projected_total * risk_data["cost_penalty_multiplier"]
        if projected_total > total_budget:
            return {"status": "WARNING", "variance": total_budget - projected_total, "projectedCost": projected_total}
        return {"status": "SAFE", "variance": total_budget - total_spent, "projectedCost": total_spent}

    in_progress_tasks = len([t for t in tasks_list if getattr(t, 'progress', 0) > 0])
    avg_cost_per_task = total_spent / in_progress_tasks if in_progress_tasks > 0 else 0
    projected_total_cost = total_spent + (avg_cost_per_task * (total_task_count - completed_tasks))
    
    if baseline_cost > 0:
        projected_total_cost = (projected_total_cost * 0.7) + (baseline_cost * 0.3)

    projected_total_cost = projected_total_cost * risk_data["cost_penalty_multiplier"]
    
    variance = total_budget - projected_total_cost
    
    status = "SAFE"
    if variance < 0:
        status = "CRITICAL"
    elif variance < (total_budget * 0.1):
        status = "WARNING"
        
    return {
        "status": status,
        "variance": variance,
        "projectedCost": projected_total_cost
    }