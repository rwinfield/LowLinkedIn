import { Graph } from "./Graph.js";

const graph = new Graph();
const nodes = new vis.DataSet();
const edges = new vis.DataSet();
const container = document.getElementById("graph-container");

const network = new vis.Network(container, {
    nodes,
    edges,
    options: {
        nodes: {
            font: {
                multi: 'html',
                bold: '16px arial black'
            }
        },
        edges: {
            arrows: { to: { enabled: true } },
        },
        physics: {
            enabled: true,
            stabilization: {
                enabled: true,
                iterations: 100, 
            },
            barnesHut: {
                gravitationalConstant: -2000, 
                springConstant: 0.04,
                damping: 0.6                
            }
        }
    },
});

function updateNodeColors() {
    const nodeColorMap = graph.getSCCColors();

    nodes.forEach((node) => {
        const color = nodeColorMap.get(node.id) || "#d3d3d3"; 
        nodes.update({ id: node.id, color: {background:"white", border: color}, borderWidth: 3});
    });
}

updateNodeColors();

document.getElementById("add-node").addEventListener("click", () => {

    if (document.getElementById("addNodePopup")) {
        document.getElementById("addNodePopup").style.display = "block";
        return;
    }

    const addNodePopup = document.createElement("div");
    addNodePopup.id = "addNodePopup";
    addNodePopup.className = "popup";

    const addNodeContent = document.createElement("div");
    addNodeContent.id = "addNodeContent";
    addNodeContent.className = "popup-content";

    const closeButton = document.createElement("span");
    closeButton.className = "close";
    closeButton.innerHTML = "&times;";

    const form = document.createElement("form");

    const nameEntryLabel = document.createElement("label");
    nameEntryLabel.htmlFor = "nameEntry";
    nameEntryLabel.innerText = "Enter the name of the new node:";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "nameEntry";
    nameInput.name = "nameEntry";
    nameInput.placeholder = "Enter node name";

    const addNodeBtn = document.createElement("button");
    addNodeBtn.type = "button";
    addNodeBtn.id = "addNodeBtn";
    addNodeBtn.innerText = "Add Node";

    form.appendChild(nameEntryLabel);
    form.appendChild(nameInput);
    form.appendChild(addNodeBtn);

    addNodeContent.appendChild(closeButton);
    addNodeContent.appendChild(form);

    addNodePopup.appendChild(addNodeContent);

    document.body.appendChild(addNodePopup);

    closeButton.onclick = function () {
        form.reset();
        addNodePopup.style.display = "none";
    }

    window.onmouseup = function (event) {
        if (event.target == addNodePopup) {
            form.reset();
            addNodePopup.style.display = "none";
        }
    };

    addNodeBtn.onclick = function () {
        const nodeName = document.getElementById("nameEntry").value;
        if (!nodeName) alert("You must enter a name.");
        else if (nodeName.length > 30) alert("Node names must be no longer than 30 characters.");
        else if (graph.nodes.has(nodeName)) alert("This node already exists!");
        else {
            graph.addNode(nodeName);
            nodes.add({
                id: nodeName, label: `<b>${nodeName}</b>`, shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.5)',
                    size: 10,
                    x: 5,
                    y: 5
                }
            });

            form.reset();
            addNodePopup.style.display = "none";
            updateNodeColors();
            document.getElementById('scc-list-container').innerHTML = "";
            displaySCCs();
        }
    }

    addNodePopup.style.display = 'block';
});

// document.getElementById("rename-node").addEventListener("click", () => {
//     const nodeId = prompt("Enter the name of the node to rename:");
//     if (!graph.nodes.has(nodeId)) {
//         alert("Node not found.");
//         return;
//     }
//     const newName = prompt("Enter the new name for the node:");
//     if (newName && !graph.nodes.has(newName)) {
//         graph.renameNode(nodeId, newName);
//         nodes.update({ id: nodeId, label: newName });
//     } else {
//         alert("Invalid or duplicate new name.");
//     }
// });

document.getElementById("delete-node").addEventListener("click", () => {
    const nodeId = prompt("Enter the name of the node to delete:");
    if (graph.nodes.has(nodeId)) {
        graph.removeNode(nodeId);
        nodes.remove({ id: nodeId });
        const edgesToRemove = edges.get({
            filter: (edge) => edge.from === nodeId || edge.to === nodeId,
        });
        edgesToRemove.forEach((edge) => edges.remove(edge));
        updateNodeColors();
        document.getElementById('scc-list-container').innerHTML = "";
        displaySCCs();
    } else {
        alert("Node not found.");
    }
});

document.getElementById("add-edge").addEventListener("click", () => {
    if (document.getElementById("addEdgePopup")) {
        document.getElementById("addEdgePopup").style.display = "block";
        return;
    }

    const addEdgePopup = document.createElement("div");
    addEdgePopup.id = "addEdgePopup";
    addEdgePopup.className = "popup"; 

    const addEdgeContent = document.createElement("div");
    addEdgeContent.id = "addEdgeContent";
    addEdgeContent.className = "popup-content"; 

    const closeButton = document.createElement("span");
    closeButton.className = "close";
    closeButton.innerHTML = "&times;";

    const form = document.createElement("form");

    const sourceLabel = document.createElement("label");
    sourceLabel.htmlFor = "sourceNode";
    sourceLabel.innerText = "Source node:";

    const sourceInput = document.createElement("input");
    sourceInput.type = "text";
    sourceInput.id = "sourceNode";
    sourceInput.name = "sourceNode";
    sourceInput.placeholder = "Enter source node";

    const targetLabel = document.createElement("label");
    targetLabel.htmlFor = "targetNode";
    targetLabel.innerText = "Target node:";

    const targetInput = document.createElement("input");
    targetInput.type = "text";
    targetInput.id = "targetNode";
    targetInput.name = "targetNode";
    targetInput.placeholder = "Enter target node";

    const addEdgeBtn = document.createElement("button");
    addEdgeBtn.type = "button";
    addEdgeBtn.id = "addEdgeBtn";
    addEdgeBtn.innerText = "Add Edge";

    // Append elements to form
    form.appendChild(sourceLabel);
    form.appendChild(sourceInput);
    form.appendChild(targetLabel);
    form.appendChild(targetInput);
    form.appendChild(addEdgeBtn);

    // Append elements to modal content
    addEdgeContent.appendChild(closeButton);
    addEdgeContent.appendChild(form);

    addEdgePopup.appendChild(addEdgeContent);

    document.body.appendChild(addEdgePopup);

    closeButton.onclick = function () {
        form.reset();
        addEdgePopup.style.display = "none";
    }

    window.onmouseup = function (event) {
        if (event.target == addEdgePopup) {
            form.reset();
            addEdgePopup.style.display = "none";
        }
    };

    addEdgeBtn.onclick = function() {
    // document.getElementById("addNodeBtn").onclick = function () {
        const from = document.getElementById("sourceNode").value;
        const to = document.getElementById("targetNode").value;
        if (graph.nodes.has(from) && graph.nodes.has(to)) {
            if (graph.edges.get(from).has(to)) {
                alert("This edge already exists!");
                return;
            } else 
            graph.addEdge(from, to);
            edges.add({
                from, to, shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.5)',
                    size: 10,
                    x: 5,
                    y: 5
                },
            });
            form.reset();
            addEdgePopup.style.display = "none";
            updateNodeColors();
            document.getElementById('scc-list-container').innerHTML = "";
            displaySCCs();
        } else {
            alert("Both nodes must exist to create an edge.");
        }
    };

    // Display the modal
    addEdgePopup.style.display = "block";
});

document.getElementById("delete-edge").addEventListener("click", () => {
    const from = prompt("Enter the source node of the edge to delete:");
    const to = prompt("Enter the target node of the edge to delete:");
    if (graph.nodes.has(from) && graph.nodes.has(to)) {
        graph.removeEdge(from, to);
        const edge = edges.get({
            filter: (edge) => edge.from === from && edge.to === to,
        })[0];
        if (edge) edges.remove(edge);
        updateNodeColors();
        document.getElementById('scc-list-container').innerHTML = "";
        displaySCCs();
    } else {
        alert("Both nodes must exist to delete an edge.");
    }
});

// document.getElementById("show-sccs").addEventListener("click", () => {
//     const sccs = graph.getSCCs();
//     const message = sccs
//         .map((scc, i) => `Circle ${i + 1}: ${scc.join(", ")}`)
//         .join("\n");
//     alert(`Social Circles:\n${message}`);
// });

network.on("click", (params) => {
    if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const badges = graph.getBadges(nodeId);
        const recommendations = getRecommendations(nodeId);
        displayPopup(nodeId, badges, recommendations);
    } else {
        closePopup();
    }
});

function getRecommendations(nodeId) {
    const connectedNodes = graph.edges.get(nodeId) || new Set();
    const recommendations = [];

    const sccs = graph.getSCCs();
    for (let scc of sccs) {
        if (scc.includes(nodeId)) {
            recommendations.push(
                ...scc.filter((node) => !connectedNodes.has(node) && node !== nodeId)
            );
            break;
        }
    }

    const commonNeighbors = {};
    for (let [neighbor, edges] of graph.edges.entries()) {
        if (connectedNodes.has(neighbor)) {
            for (let mutual of edges) {
                if (mutual !== nodeId && !connectedNodes.has(mutual)) {
                    commonNeighbors[mutual] = (commonNeighbors[mutual] || 0) + 1;
                }
            }
        }
    }
    recommendations.push(
        ...Object.entries(commonNeighbors)
            .sort((a, b) => b[1] - a[1])
            .map(([node]) => node)
    );

    return [...new Set(recommendations)];
}

function connect(to, from, btn) {
    if (graph.nodes.has(from) && graph.nodes.has(to)) {
        if (graph.edges.get(from).has(to)) {
            alert("This edge already exists!");
            return;
        } else
            graph.addEdge(from, to);
        edges.add({
            from, to, shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.5)',
                size: 10,
                x: 5,
                y: 5
            },
        });
        btn.parentElement.remove();
        const recommendationsElement = document.getElementById('recommendations');
        if (recommendationsElement.children.length === 0) {
            recommendationsElement.innerHTML = "<li>No recommendations available</li>";
        }
        updateNodeColors();
        document.getElementById('scc-list-container').innerHTML = "";
        displaySCCs();
    } else {
        alert("Both nodes must exist to create an edge.");
    }
}

window.connect = connect;

function displaySCCs() {
    const sccs = graph.getSCCs();

    const container = document.getElementById('scc-list-container');

    container.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Social circles / SCCs";
    container.appendChild(title);

    const ul = document.createElement("ul");

    // list the SCCs
    sccs.forEach((scc, i) => {
        const li = document.createElement("li");
        const alphabeticalSCC = scc.sort((a, b) => a.localeCompare(b));
        li.textContent = `Circle ${i + 1}: ${alphabeticalSCC.join(", ")}`;
        ul.appendChild(li);
    });

    container.appendChild(ul);
}

displaySCCs();

function displayPopup(nodeId, badges, recommendations) {
    const popup = document.getElementById("badges-popup");
    popup.innerHTML = `
        <h3>${nodeId}'s Details</h3>
        <h4>Badges</h4>
        <ul>${badges.map((badge) => `<li>${badge}</li>`).join("")}</ul>
        <h4>Recommended Connections</h4>
        <ul id="recommendations">${recommendations.length
            ? recommendations.map((rec) => `
                    <li id="${rec}">
                        ${rec}
                        <button onclick="connect('${rec}', '${nodeId}', this)">Connect</button>
                    </li>
                `).join("")
            : "<li>No recommendations available</li>"
        }</ul>
    `;

    popup.style.display = 'block';
}


function closePopup() {
    const popup = document.getElementById("badges-popup");
    popup.classList.add("hidden");
}

document.addEventListener("click", (event) => {
    if (
        !event.target.closest("#badges-popup") &&
        !event.target.closest(".vis-network")
    ) {
        closePopup();
    }
});

network.on("dragStart", () => {
    closePopup();
});
