"use client";

import { Activity, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, AreaChart, Area, LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

const velocityData = [{ day: "Mon", created: 5, completed: 2 }, { day: "Tue", created: 3, completed: 4 }, { day: "Wed", created: 6, completed: 5 }, { day: "Thu", created: 2, completed: 7 }, { day: "Fri", created: 4, completed: 6 }, { day: "Sat", created: 1, completed: 3 }, { day: "Sun", created: 0, completed: 2 }];
const cfdData = [{ day: "Day 1", done: 5, progress: 15, todo: 30 }, { day: "Day 2", done: 10, progress: 20, todo: 25 }, { day: "Day 3", done: 15, progress: 18, todo: 20 }, { day: "Day 4", done: 25, progress: 15, todo: 15 }, { day: "Day 5", done: 35, progress: 10, todo: 10 }, { day: "Day 6", done: 45, progress: 5, todo: 5 }];
const aiData = [{ day: "W1", actual: 10, predicted: 12 }, { day: "W2", actual: 25, predicted: 24 }, { day: "W3", actual: 40, predicted: 42 }, { day: "W4", actual: null, predicted: 65 }, { day: "W5", actual: null, predicted: 85 }, { day: "W6", actual: null, predicted: 100 }];

const analyticsFeatures = [
  {
    name: "Velocity Tracking", highlight: "Capacity Planning", description: "Monitor daily created vs. completed tasks to measure your team's true capacity.", features: ["Daily throughput analysis", "Scope creep detection", "Interactive 7-day trend"], icon: Activity, popular: false,
    Visual: () => (
      <div className="h-32 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={velocityData}><Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /><Bar dataKey="created" fill="#64748b" radius={[4, 4, 0, 0]} name="New Tasks" /><Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Completed" /></BarChart>
        </ResponsiveContainer>
      </div>
    ),
  },
  {
    name: "Cumulative Flow", highlight: "Bottleneck Detection", description: "Visualize task statuses over time. Instantly identify bottlenecks in your workflow.", features: ["Stacked area charts", "Status distribution", "Blocker identification"], icon: Layers, popular: true,
    Visual: () => (
      <div className="h-32 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cfdData}><Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /><Area type="monotone" dataKey="todo" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="To Do" /><Area type="monotone" dataKey="progress" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="In Progress" /><Area type="monotone" dataKey="done" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Done" /></AreaChart>
        </ResponsiveContainer>
      </div>
    ),
  },
  {
    name: "AI Forecasting", highlight: "Machine Learning", description: "Our integrated Python AI engine calculates linear regression to forecast true completion dates.", features: ["Deadline probability", "Budget risk alerts", "NLP effort suggestions"], icon: Sparkles, popular: false,
    Visual: () => (
      <div className="h-32 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={aiData}><Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} /><Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Actual Progress" /><Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" name="AI Prediction" /></LineChart>
        </ResponsiveContainer>
      </div>
    ),
  },
];

export const LandingAnalytics = () => {
  return (
    <section id="analytics" className="py-24 bg-card border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-grade Analytics, <span className="text-primary">Powered by AI.</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Stop guessing. Make data-driven decisions with interactive charts, integrated Python machine learning, and gamified effort tracking.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {analyticsFeatures.map((item, idx) => (
            <div key={idx} className={`relative flex flex-col p-8 rounded-3xl border ${item.popular ? "border-primary shadow-lg bg-background" : "border-border bg-background"}`}>
              {item.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><Badge className="bg-primary text-primary-foreground px-3 py-1">Most Powerful</Badge></div>}
              <div className="mb-6">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary"><item.icon className="size-6" /></div>
                <Badge variant="secondary" className="mb-3">{item.highlight}</Badge>
                <h3 className="text-2xl font-bold mb-3">{item.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1 mt-4 border-t border-border/50 pt-6">
                {item.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3"><CheckCircle2 className="size-4 text-primary shrink-0" /><span className="text-sm font-medium">{feature}</span></li>
                ))}
              </ul>
              <div className="mt-auto border-t border-border/50 pt-2"><item.Visual /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};