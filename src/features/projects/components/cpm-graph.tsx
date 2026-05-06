"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  MarkerType,
  Node,
  Edge,
} from "@xyflow/react";

// @ts-ignore
import "@xyflow/react/dist/style.css";

import dagre from "dagre";
import { calculateCPM, CPMNode } from "../hooks/cpm-calculator";
import CPMCustomNode from "./cpm-custom-node";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PageLoader } from "@/components/page-loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const nodeTypes = {
  cpmNode: CPMCustomNode,
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "LR",
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === "LR" ? "left" : ("top" as any);
    node.sourcePosition = direction === "LR" ? "right" : ("bottom" as any);

    node.position = {
      x: nodeWithPosition.x - 200 / 2,
      y: nodeWithPosition.y - 120 / 2,
    };
    return node;
  });

  return { nodes, edges };
};

interface CPMGraphProps {
  projectId?: string;
}

export const CPMGraph = ({ projectId }: CPMGraphProps) => {
  const workspaceId = useWorkspaceId();
  const { data: tasks, isLoading } = useGetTasks({ workspaceId, projectId });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [cpmData, setCpmData] = useState<CPMNode[]>([]);

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const cpmResults: CPMNode[] = calculateCPM(tasks);
    setCpmData(cpmResults);

    const initialNodes: Node[] = cpmResults.map((result) => ({
      id: result.id,
      type: "cpmNode",
      position: { x: 0, y: 0 },
      data: { ...result },
    }));

    const initialEdges: Edge[] = [];
    cpmResults.forEach((result) => {
      result.successors.forEach((succId) => {
        const targetNode = cpmResults.find((n) => n.id === succId);
        const isCriticalEdge = result.isCritical && targetNode?.isCritical;

        initialEdges.push({
          id: `e-${result.id}-${succId}`,
          source: result.id,
          target: succId,
          type: "smoothstep",
          animated: isCriticalEdge,
          style: {
            stroke: isCriticalEdge ? "#ef4444" : "#94a3b8",
            strokeWidth: isCriticalEdge ? 3 : 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isCriticalEdge ? "#ef4444" : "#94a3b8",
          },
        });
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [tasks, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <PageLoader />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/20 border border-dashed rounded-lg">
        No tasks available for CPM analysis.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="graph" className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-muted/20 rounded-t-lg">
          <h2 className="text-lg font-bold">CPM Analysis</h2>
          <TabsList>
            <TabsTrigger value="graph">Network Diagram</TabsTrigger>
            <TabsTrigger value="table">Tabular Data</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="graph" className="m-0 flex-1 relative h-[500px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            panOnScroll={false}
            zoomOnScroll={true}
            elementsSelectable={true}
            nodesDraggable={true}
            attributionPosition="bottom-right"
          >
            <Background color="#ccc" gap={16} />
            <Controls
              showInteractive={true}
              className="bg-card border-border fill-foreground [&>button]:bg-card [&>button]:border-border [&>button]:fill-foreground hover:[&>button]:bg-muted"
            />
            <Panel
              position="top-left"
              className="bg-card/80 p-2 rounded border shadow-sm backdrop-blur-sm"
            >
              <h3 className="text-sm font-bold mb-2">Legend</h3>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-red-500 rounded-full" />
                  <span>Critical Path (No Slack)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-slate-400 rounded-full" />
                  <span>Normal Path</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </TabsContent>

        <TabsContent value="table" className="m-0 p-4 h-[500px] overflow-auto">
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead className="text-center">Duration</TableHead>
                  <TableHead className="text-center">ES</TableHead>
                  <TableHead className="text-center">EF</TableHead>
                  <TableHead className="text-center">LS</TableHead>
                  <TableHead className="text-center">LF</TableHead>
                  <TableHead className="text-center">Slack (Float)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cpmData.map((node) => (
                  <TableRow key={node.id}>
                    <TableCell
                      className="font-medium max-w-[200px] truncate"
                      title={node.name}
                    >
                      {node.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {node.duration}d
                    </TableCell>
                    <TableCell className="text-center">{node.es}</TableCell>
                    <TableCell className="text-center">{node.ef}</TableCell>
                    <TableCell className="text-center">{node.ls}</TableCell>
                    <TableCell className="text-center">{node.lf}</TableCell>
                    <TableCell className="text-center">{node.slack}</TableCell>
                    <TableCell className="text-center">
                      {node.isCritical ? (
                        <Badge variant="destructive">Critical</Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
