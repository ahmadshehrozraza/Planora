from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime

from ml_models.deadline_model import predict_deadline
from ml_models.budget_model import predict_budget_risk
from ml_models.nlp_estimator import suggest_effort_points

app = FastAPI(title="Planora AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskData(BaseModel):
    id: str
    progress: int
    effortPoints: int
    budget: float
    priority: str

class ProjectAnalyticsRequest(BaseModel):
    startDate: str
    dueDate: str
    totalBudget: float
    tasks: List[TaskData]

class TaskEstimationRequest(BaseModel):
    description: str
    taskType: str


@app.get("/")
def read_root():
    return {"status": "AI Engine is running with CORS enabled"}

@app.post("/api/predict-analytics")
def analyze_project(data: ProjectAnalyticsRequest):
    try:
        deadline_prediction = predict_deadline(data.startDate, data.dueDate, data.tasks)
        
        budget_risk = predict_budget_risk(data.totalBudget, data.tasks)

        return {
            "success": True,
            "deadline": deadline_prediction,
            "budgetRisk": budget_risk
        }
    except Exception as e:
        print(f"Error in predict-analytics: {e}") 
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/suggest-effort")
def estimate_task(data: TaskEstimationRequest):
    try:
        suggestion = suggest_effort_points(data.description, data.taskType)
        return {"success": True, "suggestion": suggestion}
    except Exception as e:
        print(f"Error in suggest-effort: {e}")
        raise HTTPException(status_code=500, detail=str(e))