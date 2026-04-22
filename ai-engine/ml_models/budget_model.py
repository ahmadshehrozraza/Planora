def predict_budget_risk(total_budget: float, tasks: list) -> dict:
    if total_budget <= 0:
         return {"status": "SAFE", "variance": 0, "projectedCost": 0}
         
    total_spent = sum([t.budget for t in tasks if t.progress > 0])
    completed_tasks = len([t for t in tasks if t.progress == 100])
    total_task_count = len(tasks)
    
    if completed_tasks == 0:
        return {"status": "SAFE", "variance": total_budget - total_spent, "projectedCost": total_spent}

    avg_cost_per_task = total_spent / (len([t for t in tasks if t.progress > 0]) or 1)
    projected_total_cost = total_spent + (avg_cost_per_task * (total_task_count - completed_tasks))
    
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