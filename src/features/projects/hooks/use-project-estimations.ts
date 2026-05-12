import { useState, useEffect } from "react";
import { differenceInDays, addDays, isAfter } from "date-fns";
import { aiClient } from "@/lib/ai-client";

export const useProjectEstimations = (analytics: any) => {
  const [estimations, setEstimations] = useState<any>(null);

  useEffect(() => {
    // Determine the true data payload (handling wrapped vs unwrapped responses)
    const payload = analytics?.data || analytics;
    
    if (!payload || Object.keys(payload).length === 0) {
      setEstimations(null);
      return;
    }

    const generateEstimations = async () => {
      const { meta = {}, kpi = {}, tasks = [], risks = [] } = payload;
      const today = new Date();
      
      const totalEffort = tasks?.reduce((acc: number, t: any) => acc + (t.effortPoints || 1), 0) || 1;
      const completedEffort = tasks?.filter((t: any) => t.progress === 100).reduce((acc: number, t: any) => acc + (t.effortPoints || 1), 0) || 0;

      let daysElapsed = 0;
      let projectedDateMath = today;
      let isDelayedMath = false;
      let delayDaysMath = 0;

      try {
        if (meta?.startDate) daysElapsed = differenceInDays(today, new Date(meta.startDate));
        
        const velocity = daysElapsed > 0 ? (completedEffort / daysElapsed) : 0; 
        const pointsRemaining = Math.max(0, totalEffort - completedEffort);
        const daysNeededToComplete = velocity > 0 ? Math.ceil(pointsRemaining / velocity) : 0;
        
        projectedDateMath = addDays(today, daysNeededToComplete);
        
        if (meta?.dueDate) {
          isDelayedMath = isAfter(projectedDateMath, new Date(meta.dueDate));
          delayDaysMath = differenceInDays(projectedDateMath, new Date(meta.dueDate));
        }
      } catch (e) {
        console.error("Math Date parsing failed:", e);
      }

      const pointsRemainingMath = Math.max(0, totalEffort - completedEffort);
      const avgCostPerPoint = completedEffort > 0 ? ((kpi?.budgetUsed || 0) / completedEffort) : 0;
      const projectedTotalCostMath = (kpi?.budgetUsed || 0) + (pointsRemainingMath * avgCostPerPoint);
      const projectedBudgetVarianceMath = (meta?.budget || 0) - projectedTotalCostMath;

      const baseResult = {
        velocity: daysElapsed > 0 ? (completedEffort / daysElapsed) : 0,
        pointsRemaining: pointsRemainingMath,
        projectedDate: projectedDateMath,
        isDelayed: isDelayedMath,
        delayDays: delayDaysMath > 0 ? delayDaysMath : 0,
        projectedTotalCost: projectedTotalCostMath,
        projectedBudgetVariance: projectedBudgetVarianceMath,
        aiConfidence: 50,
        budgetRisk: projectedBudgetVarianceMath < 0 ? "CRITICAL" : "SAFE",
        isAiPowered: false,
        errorLogs: null
      };

      setEstimations(baseResult);

      try {
        const mappedTasks = tasks?.map((t: any) => ({
          id: String(t.id),
          progress: Number(t.progress) || 0,
          effortPoints: Number(t.effortPoints) || 1,
          budget: Number(t.budget) || 0,
          priority: String(t.priority || "MEDIUM")
        })) || [];

        const mappedRisks = risks?.map((r: any) => ({
          id: String(r.id),
          probability: String(r.probability || "MEDIUM"),
          impact: String(r.impact || "MEDIUM"),
          status: String(r.status || "OPEN")
        })) || [];

        const safeStartDate = meta?.startDate ? new Date(meta.startDate).toISOString() : new Date().toISOString();
        const safeDueDate = meta?.dueDate ? new Date(meta.dueDate).toISOString() : addDays(new Date(), 30).toISOString();

        const aiPayload = {
          startDate: safeStartDate,
          dueDate: safeDueDate,
          totalBudget: Number(meta?.budget) || 0,
          tasks: mappedTasks,
          risks: mappedRisks,
          baselineEffort: Number(meta?.calculatedEffort) || 0.0,
          baselineCost: Number(meta?.calculatedCost) || 0.0
        };

        console.log("📤 Sending payload to Python API:", aiPayload);
        const aiResponse = await aiClient.predictAnalytics(aiPayload);
        console.log("📥 Received from Python API:", aiResponse);
        
        if (aiResponse?.success) {
          const aiResult = {
            ...baseResult,
            projectedDate: new Date(aiResponse.deadline.projectedDate),
            isDelayed: aiResponse.deadline.isDelayed,
            delayDays: aiResponse.deadline.delayDays,
            aiConfidence: aiResponse.deadline.confidenceScore,
            budgetRisk: aiResponse.budgetRisk.status,
            projectedTotalCost: aiResponse.budgetRisk.projectedCost,
            projectedBudgetVariance: aiResponse.budgetRisk.variance,
            isAiPowered: true,
            errorLogs: null
          };
          setEstimations(aiResult);
        } else {
            setEstimations({ ...baseResult, errorLogs: "Python API returned success: false" });
        }
      } catch (error: any) {
        console.error("❌ PYTHON API CONNECTION FAILED:", error);
        setEstimations({ ...baseResult, errorLogs: error.message || "Connection to Python Server Refused" });
      }
    };

    generateEstimations();
  }, [analytics]);

  return estimations;
};