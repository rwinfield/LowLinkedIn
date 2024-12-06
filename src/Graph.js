export class Graph {
    constructor() {
        this.nodes = new Set();
        this.edges = new Map();
    }

    addNode(node) {
        this.nodes.add(node);
        if (!this.edges.has(node)) {
            this.edges.set(node, new Set());
        }
    }

    removeNode(node) {
        this.nodes.delete(node);
        this.edges.delete(node);
        for (let neighbors of this.edges.values()) {
            neighbors.delete(node);
        }
    }

    addEdge(from, to) {
        if (!this.nodes.has(from) || !this.nodes.has(to)) {
            throw new Error("Both nodes must exist to add an edge.");
        }
        this.edges.get(from).add(to);
    }

    removeEdge(from, to) {
        if (this.edges.has(from)) {
            this.edges.get(from).delete(to);
        }
    }

    getSCCs() {
        const indexMap = new Map();
        const lowLink = new Map();
        const onStack = new Set();
        const stack = [];
        let i = 0;
        const sccs = [];

        const dfs = (node) => {
            indexMap.set(node, i);
            lowLink.set(node, i);
            i++;
            stack.push(node);
            onStack.add(node);

            for (let neighbor of this.edges.get(node) || []) {
                if (!indexMap.has(neighbor)) {
                    dfs(neighbor);
                    lowLink.set(node, Math.min(lowLink.get(node), lowLink.get(neighbor)));
                } else if (onStack.has(neighbor)) {
                    lowLink.set(node, Math.min(lowLink.get(node), indexMap.get(neighbor)));
                }
            }

            if (lowLink.get(node) === indexMap.get(node)) {
                const scc = [];
                let w;
                // pop from stack
                do {
                    w = stack.pop();
                    onStack.delete(w);
                    scc.push(w);
                } while (w !== node);
                sccs.push(scc);
            }
        };

        for (let node of this.nodes) {
            if (!indexMap.has(node)) {
                dfs(node);
            }
        }
        return sccs;
    }

    getBadges(node) {
        const sccs = this.getSCCs();
        let badges = [];

        // connector and outreacher badges
        for (let scc of sccs) {
            if (scc.includes(node)) {
                if (scc.length > 1) badges.push("Connector Badge (belongs to one SCC)");
                if (scc.length >= 5) badges.push("Outreacher Badge (belongs to an SCC with at least 5 people)");
                break;
            }
        }

        // hub badge
        if ((this.edges.get(node) || []).size >= 3) {
            badges.push("Hub Badge (has connections with at least 3 people)");
        }

        // well-connected badge
        let incomingCount = 0;
        for (let [from, neighbors] of this.edges.entries()) {
            if (neighbors.has(node)) incomingCount++;
        }
        if (incomingCount >= 3) {
            badges.push("Celebrity Badge (has at least 3 incoming connections)");
        }

        return badges.length > 0 ? badges : ["No Badges"];
    }

    renameNode(oldName, newName) {
        if (!this.nodes.has(oldName) || this.nodes.has(newName)) return;
        this.nodes.delete(oldName);
        this.nodes.add(newName);

        const oldEdges = this.edges.get(oldName) || new Set();
        this.edges.delete(oldName);
        this.edges.set(newName, oldEdges);

        for (let [node, neighbors] of this.edges.entries()) {
            if (neighbors.has(oldName)) {
                neighbors.delete(oldName);
                neighbors.add(newName);
            }
        }
    }

    removeNode(nodeId) {
        if (!this.nodes.has(nodeId)) return;
        this.nodes.delete(nodeId);
        this.edges.delete(nodeId);

        for (let neighbors of this.edges.values()) {
            neighbors.delete(nodeId);
        }
    }

    removeEdge(from, to) {
        if (this.edges.has(from)) {
            this.edges.get(from).delete(to);
        }
    }


    getSCCColors() {
        const sccs = this.getSCCs();
        const colors = [
            "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4",
            "#42d4f4", "#f032e6", "#bfef45", "#fabebe", "#469990", "#e6beff",
            "#9a6324", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1",
            "#000075", "#a9a9a9",
        ];

        const nodeColorMap = new Map();
        sccs.forEach((scc, index) => {
            // choose a color for the node
            const color = colors[index % colors.length];
            scc.forEach((node) => nodeColorMap.set(node, color));
        });

        return nodeColorMap;
    }

}
