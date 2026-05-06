export interface CPMNode {
    id: string;
    name: string;
    duration: number;
    es: number;
    ef: number;
    ls: number;
    lf: number;
    slack: number;
    isCritical: boolean;
    predecessors: string[];
    successors: string[];
    originalData: any;
}

export const calculateCPM = (tasks: any[]): CPMNode[] => {
    if (!tasks || tasks.length === 0) return [];

    const nodes: Record<string, CPMNode> = {};
    const inDegree: Record<string, number> = {};

    tasks.forEach(task => {
        let duration = 1;
        if (task.startDate && task.dueDate) {
            const start = new Date(task.startDate).getTime();
            const end = new Date(task.dueDate).getTime();
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            duration = diffDays > 0 ? diffDays : 1; 
        }

        const predecessors = Array.isArray(task.blockedBy) ? task.blockedBy.map((t: any) => t.id) : [];
        const successors = Array.isArray(task.blocking) ? task.blocking.map((t: any) => t.id) : [];

        nodes[task.id] = {
            id: task.id,
            name: task.name,
            duration,
            es: 0,
            ef: 0,
            ls: 0,
            lf: 0,
            slack: 0,
            isCritical: false,
            predecessors,
            successors,
            originalData: task
        };

        inDegree[task.id] = predecessors.length;
    });

    const queue: string[] = [];
    const topoOrder: string[] = [];

    Object.keys(inDegree).forEach(id => {
        if (inDegree[id] === 0) {
            queue.push(id);
        }
    });

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        topoOrder.push(currentId);
        const current = nodes[currentId];

        current.ef = current.es + current.duration;

        current.successors.forEach(succId => {
            if (nodes[succId]) {
                if (current.ef > nodes[succId].es) {
                    nodes[succId].es = current.ef;
                }
                inDegree[succId] -= 1;
                if (inDegree[succId] === 0) {
                    queue.push(succId);
                }
            }
        });
    }

    if (topoOrder.length !== tasks.length) {
        console.error("Circular dependency detected in tasks. CPM calculation aborted for affected nodes.");
    }

    let projectDuration = 0;
    topoOrder.forEach(id => {
        if (nodes[id].ef > projectDuration) {
            projectDuration = nodes[id].ef;
        }
    });

    topoOrder.forEach(id => {
        nodes[id].lf = projectDuration;
        nodes[id].ls = nodes[id].lf - nodes[id].duration;
    });

    for (let i = topoOrder.length - 1; i >= 0; i--) {
        const currentId = topoOrder[i];
        const current = nodes[currentId];

        current.ls = current.lf - current.duration;

        current.predecessors.forEach(predId => {
            if (nodes[predId]) {
                if (nodes[predId].lf > current.ls || nodes[predId].lf === projectDuration) {
                     if (nodes[predId].successors.every(sId => nodes[sId] && nodes[sId].ls >= current.ls)) {
                         nodes[predId].lf = current.ls;
                     } else {
                         const minLsSuccessor = Math.min(...nodes[predId].successors.map(sId => nodes[sId] ? nodes[sId].ls : projectDuration));
                         nodes[predId].lf = minLsSuccessor;
                     }
                }
            }
        });
    }

    topoOrder.forEach(id => {
        const node = nodes[id];
        node.slack = node.ls - node.es;
        if (node.slack < 0) node.slack = 0; 
        node.isCritical = node.slack === 0;
    });

    return Object.values(nodes);
};