import { useState, useEffect } from "react";
import { differenceInDays, addDays, isAfter } from "date-fns";
import { aiClient } from "@/lib/ai-client";

export const useProjectEstimations = (analytics: any) => {
  const [estimations, setEstimations] = useState<any>(null);

  useEffect(() => {
    if (!analytics) {
      setEstimations(null);
      return;
    }

    const generateEstimations = async () => {
      const { meta, kpi, tasks } = analytics;
      const today = new Date();
      
      const totalEffort = tasks?.reduce((acc: number, t: any) => acc + (t.effortPoints || 1), 0) || 1;
      const completedEffort = tasks?.filter((t: any) => t.progress === 100).reduce((acc: number, t: any) => acc + (t.effortPoints || 1), 0) || 0;

      const daysElapsed = differenceInDays(today, new Date(meta.startDate));
      
      const velocity = daysElapsed > 0 ? (completedEffort / daysElapsed) : 0; 
      
      const pointsRemaining = totalEffort - completedEffort;
      const daysNeededToComplete = velocity > 0 ? Math.ceil(pointsRemaining / velocity) : 0;
      const projectedDateMath = addDays(today, daysNeededToComplete);
      
      const isDelayedMath = isAfter(projectedDateMath, new Date(meta.dueDate));
      const delayDaysMath = differenceInDays(projectedDateMath, new Date(meta.dueDate));

      const avgCostPerPoint = completedEffort > 0 ? (kpi.budgetUsed / completedEffort) : 0;
      const projectedTotalCostMath = kpi.budgetUsed + (pointsRemaining * avgCostPerPoint);
      const projectedBudgetVarianceMath = meta.budget - projectedTotalCostMath;

      let result = {
        velocity,
        pointsRemaining,
        projectedDate: projectedDateMath,
        isDelayed: isDelayedMath,
        delayDays: delayDaysMath > 0 ? delayDaysMath : 0,
        projectedTotalCost: projectedTotalCostMath,
        projectedBudgetVariance: projectedBudgetVarianceMath,
        aiConfidence: 50,
        budgetRisk: projectedBudgetVarianceMath < 0 ? "CRITICAL" : "SAFE",
        isAiPowered: false
      };

      try {
        const mappedTasks = tasks?.map((t: any) => ({
          id: t.id,
          progress: t.progress || 0,
          effortPoints: t.effortPoints || 1,
          budget: t.budget || 0,
          priority: t.priority || "MEDIUM"
        })) || [];

        const aiPayload = {
          startDate: new Date(meta.startDate).toISOString(),
          dueDate: new Date(meta.dueDate).toISOString(),
          totalBudget: meta.budget || 0,
          tasks: mappedTasks
        };

        const aiResponse = await aiClient.predictAnalytics(aiPayload);
        
        if (aiResponse?.success) {
          result.projectedDate = new Date(aiResponse.deadline.projectedDate);
          result.isDelayed = aiResponse.deadline.isDelayed;
          result.delayDays = aiResponse.deadline.delayDays;
          result.aiConfidence = aiResponse.deadline.confidenceScore;
          
          result.budgetRisk = aiResponse.budgetRisk.status;
          result.projectedTotalCost = aiResponse.budgetRisk.projectedCost;
          result.projectedBudgetVariance = aiResponse.budgetRisk.variance;
          result.isAiPowered = true;
        }
      } catch (error) {
        console.error("AI Estimation failed, falling back to Math logic", error);
      }

      setEstimations(result);
    };

    generateEstimations();
  }, [analytics]);

  return estimations;
};