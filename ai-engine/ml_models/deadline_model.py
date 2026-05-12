from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression
from ml_models.risk_analyzer import calculate_risk_exposure

def predict_deadline(start_date_str: str, due_date_str: str, tasks: list, risks: list, baseline_effort: float) -> dict:
    try:
        start_date = datetime.fromisoformat(str(start_date_str).replace("Z", "+00:00")).replace(tzinfo=None)
        due_date = datetime.fromisoformat(str(due_date_str).replace("Z", "+00:00")).replace(tzinfo=None)
    except Exception:
        return {"projectedDate": due_date_str, "isDelayed": False, "delayDays": 0, "confidenceScore": 0}
    
    tasks_list = tasks if tasks else []
    total_points = sum([getattr(t, 'effortPoints', 0) for t in tasks_list])
    
    if total_points == 0:
        return {"projectedDate": due_date_str, "isDelayed": False, "delayDays": 0, "confidenceScore": 100}

    completed_points = sum([getattr(t, 'effortPoints', 0) for t in tasks_list if getattr(t, 'progress', 0) == 100])
    
    if completed_points == 0:
        predicted_total_days = (due_date - start_date).days
        base_confidence = 50
    else:
        try:
            X = np.array([[0], [completed_points]])
            days_elapsed = max((datetime.utcnow() - start_date).days, 1)
            y = np.array([0, days_elapsed])
            
            model = LinearRegression().fit(X, y)
            predicted_total_days = model.predict([[total_points]])[0]
            base_confidence = min(90, int(70 + (completed_points / total_points * 20)))
        except Exception:
            predicted_total_days = (due_date - start_date).days
            base_confidence = 50

    risk_data = calculate_risk_exposure(risks)
    predicted_total_days = predicted_total_days * risk_data["schedule_penalty_multiplier"]
    
    cocomo_penalty = 0
    if baseline_effort and baseline_effort > 0:
        planned_duration = max((due_date - start_date).days, 1)
        cocomo_days = baseline_effort * 22 
        if cocomo_days > planned_duration:
            cocomo_penalty = (cocomo_days - planned_duration) * 0.3 

    final_predicted_days = max(0, predicted_total_days + cocomo_penalty)
    projected_date = start_date + timedelta(days=int(final_predicted_days))
    
    delay_days = (projected_date - due_date).days
    
    if risk_data["score"] > 0:
        base_confidence -= min(20, int(risk_data["score"]))
    
    return {
        "projectedDate": projected_date.isoformat(),
        "isDelayed": delay_days > 0,
        "delayDays": max(0, delay_days),
        "confidenceScore": max(10, base_confidence)
    }