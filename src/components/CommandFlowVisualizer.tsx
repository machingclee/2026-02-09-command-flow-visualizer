import { useMemo, useState, useCallback } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Handle,
    type Node,
    type Edge,
    MarkerType,
    Position,
    useNodesState,
    useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";


interface Command {
    from: string;
    to: string[];
}

interface PolicyFlow {
    fromEvent: string | null;
    toCommand: string | null;
    invariant: string;
}

interface PolicyData {
    flows: PolicyFlow[];
}

interface FlowData {
    commands: Command[];
    policies: { [policyName: string]: PolicyData };
}

const VERTICAL_SPACING = 75;
const NODE_WIDTH = "400px"; // Global default width for all cells
const FONT_SIZE = "16px"; // Global font size for node labels

// Horizontal positions for each column
const COMMAND_X = 100;
const EVENT_X = 600;
const POLICY_X = 1200;

const PolicyNode = ({ data }: { data: { label: string; flows: PolicyFlow[] } }) => (
    <div
        style={{
            background: "#c084fc",
            border: "2px solid #a855f7",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#fff",
            width: NODE_WIDTH,
            boxSizing: "border-box",
            position: "relative",
        }}
    >
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />
        <div
            style={{
                fontWeight: "bold",
                fontSize: FONT_SIZE,
                marginBottom: "8px",
                paddingBottom: "6px",
                borderBottom: "1px solid rgba(255,255,255,0.45)",
            }}
        >
            {data.label}
        </div>
        <div style={{
            display: "flex", justifyContent: "center",
            fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85, marginBottom: "6px",
        }}>
            Invariants
        </div>
        <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
            {data.flows.map((flow, i) => (
                <li key={i} style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "13px", lineHeight: 1.5, marginBottom: "4px" }}>
                        {flow.invariant}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                        {flow.fromEvent ? (
                            <span style={{
                                display: "inline-block",
                                background: "rgba(249,115,22,0.85)",
                                border: "1px solid rgba(255,255,255,0.4)",
                                borderRadius: "4px",
                                padding: "1px 7px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                letterSpacing: "0.02em",
                            }}>
                                {flow.fromEvent}
                            </span>
                        ) : (
                            <span style={{
                                display: "inline-block",
                                background: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "4px",
                                padding: "1px 7px",
                                fontSize: "11px",
                                fontStyle: "italic",
                                opacity: 0.7,
                            }}>
                                To Be Arranged
                            </span>
                        )}
                        <span style={{ fontSize: "11px", opacity: 0.7 }}>→</span>
                        {flow.toCommand ? (
                            <span style={{
                                display: "inline-block",
                                background: "rgba(37,99,235,0.85)",
                                border: "1px solid rgba(255,255,255,0.4)",
                                borderRadius: "4px",
                                padding: "1px 7px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                letterSpacing: "0.02em",
                            }}>
                                {flow.toCommand}
                            </span>
                        ) : (
                            <span style={{
                                display: "inline-block",
                                background: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "4px",
                                padding: "1px 7px",
                                fontSize: "11px",
                                fontStyle: "italic",
                                opacity: 0.7,
                            }}>
                                To Be Arranged
                            </span>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

const nodeTypes = { policyNode: PolicyNode };


const CommandFlowVisualizer = (props: {
    commands: {
        commands: Command[];
        policies: { [policyName: string]: PolicyData };
    };
}) => {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [_copiedText, setCopiedText] = useState<string | null>(null);

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const flowData: FlowData = props.commands as FlowData;
        const nodeMap = new Map<string, Node>();
        const edgeList: Edge[] = [];

        let yOffset = 0;

        // Create command nodes and their events
        flowData.commands.forEach((item) => {
            const commandId = `command-${item.from}`;
            const eventCount = item.to.length;
            const totalEventHeight = (eventCount - 1) * 100;
            const commandY = yOffset + totalEventHeight / 2;

            // Add command node (centered vertically relative to its events)
            if (!nodeMap.has(commandId)) {
                nodeMap.set(commandId, {
                    id: commandId,
                    type: "default",
                    data: { label: item.from },
                    position: { x: COMMAND_X, y: commandY },
                    style: {
                        background: "#2563eb",
                        color: "#fff",
                        border: "2px solid #1d4ed8",
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: FONT_SIZE,
                        width: NODE_WIDTH,
                    },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                });
            }

            // Add event nodes - each gets unique position even if same event name
            item.to.forEach((eventName, eventIndex) => {
                const eventY = yOffset + eventIndex * 100;
                const eventId = `event-${eventName}`;

                // Check if this event already exists
                if (!nodeMap.has(eventId)) {
                    nodeMap.set(eventId, {
                        id: eventId,
                        type: "default",
                        data: { label: eventName },
                        position: { x: EVENT_X, y: eventY },
                        style: {
                            background: "#f97316",
                            color: "#fff",
                            border: "2px solid #ea580c",
                            borderRadius: "8px",
                            padding: "10px",
                            fontSize: FONT_SIZE,
                            width: NODE_WIDTH,
                        },
                        sourcePosition: Position.Right,
                        targetPosition: Position.Left,
                    });
                }
                // If event already exists, don't move it - keep original position

                // Add edge from command to event
                edgeList.push({
                    id: `${commandId}-${eventId}`,
                    source: commandId,
                    target: eventId,
                    type: "smoothstep",
                    animated: true,
                    style: { stroke: "#64748b", strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: "#64748b",
                    },
                });
            });

            yOffset += totalEventHeight + VERTICAL_SPACING;
        });

        // Add policy nodes with event → policy → command connections
        const POLICY_EDGE_COLOR = "#a855f7";
        let policyYOffset = 0;
        Object.entries(flowData.policies).forEach(([policyName, policyData]) => {
            const policyId = `policy-${policyName}`;

            nodeMap.set(policyId, {
                id: policyId,
                type: "policyNode",
                data: { label: policyName, flows: policyData.flows },
                position: { x: POLICY_X, y: policyYOffset },
                style: {},
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            });

            // Estimate node height: header ~44px + each invariant ~46px + gap 60px
            policyYOffset += policyData.flows.length * 46 + 44 + 60;

            // Add edges for each flow: event → policy and policy → command
            policyData.flows.forEach((flow) => {
                // Skip flows where both sides are null (still in design)
                if (flow.fromEvent === null && flow.toCommand === null) return;

                if (flow.fromEvent !== null) {
                    const eventId = `event-${flow.fromEvent}`;

                    // Create external event node if it doesn't exist yet
                    if (!nodeMap.has(eventId)) {
                        nodeMap.set(eventId, {
                            id: eventId,
                            type: "default",
                            data: { label: flow.fromEvent },
                            position: { x: EVENT_X, y: yOffset },
                            style: {
                                background: "#f97316",
                                color: "#fff",
                                border: "2px solid #ea580c",
                                borderRadius: "8px",
                                padding: "10px",
                                fontSize: FONT_SIZE,
                                width: NODE_WIDTH,
                            },
                            sourcePosition: Position.Right,
                            targetPosition: Position.Left,
                        });
                        yOffset += VERTICAL_SPACING;
                    }

                    // event → policy
                    const ep = `${eventId}-${policyId}`;
                    if (!edgeList.find((e) => e.id === ep)) {
                        edgeList.push({
                            id: ep,
                            source: eventId,
                            target: policyId,
                            type: "smoothstep",
                            animated: true,
                            style: { stroke: POLICY_EDGE_COLOR, strokeWidth: 2 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: POLICY_EDGE_COLOR },
                        });
                    }
                }

                // policy → command
                if (flow.toCommand !== null) {
                    const commandId = `command-${flow.toCommand}`;
                    if (nodeMap.has(commandId)) {
                        const pc = `${policyId}-${commandId}`;
                        if (!edgeList.find((e) => e.id === pc)) {
                            edgeList.push({
                                id: pc,
                                source: policyId,
                                target: commandId,
                                type: "smoothstep",
                                animated: true,
                                style: { stroke: POLICY_EDGE_COLOR, strokeWidth: 2 },
                                markerEnd: { type: MarkerType.ArrowClosed, color: POLICY_EDGE_COLOR },
                            });
                        }
                    }
                }
            });
        });

        return {
            nodes: Array.from(nodeMap.values()),
            edges: edgeList,
        };
    }, []);

    const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            setSelectedNode(selectedNode === node.id ? null : node.id);

            // Copy node label to clipboard
            const label = node.data.label as string;
            navigator.clipboard
                .writeText(label)
                .then(() => {
                    setCopiedText(label);
                    setTimeout(() => setCopiedText(null), 2000);
                })
                .catch((err) => {
                    console.error("Failed to copy text: ", err);
                });
        },
        [selectedNode]
    );

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    // Compute highlighted edges based on selected node
    const highlightedEdges = useMemo(() => {
        if (!selectedNode) return edges;

        return edges.map((edge) => {
            const isConnected = edge.source === selectedNode || edge.target === selectedNode;
            return {
                ...edge,
                style: {
                    ...edge.style,
                    opacity: isConnected ? 1 : 0.15,
                    strokeWidth: isConnected ? 3 : 2,
                },
                animated: isConnected,
            };
        });
    }, [edges, selectedNode]);

    // Compute highlighted nodes based on selected node
    const highlightedNodes = useMemo(() => {
        if (!selectedNode) return nodes;

        const connectedNodeIds = new Set<string>();
        connectedNodeIds.add(selectedNode);

        edges.forEach((edge) => {
            if (edge.source === selectedNode) {
                connectedNodeIds.add(edge.target);
            }
            if (edge.target === selectedNode) {
                connectedNodeIds.add(edge.source);
            }
        });

        return nodes.map((node) => {
            const isConnected = connectedNodeIds.has(node.id);
            return {
                ...node,
                style: {
                    ...node.style,
                    opacity: isConnected ? 1 : 0.3,
                },
            };
        });
    }, [nodes, edges, selectedNode]);

    return (
        <div className="w-screen h-screen">
            <ReactFlow
                nodeTypes={nodeTypes}
                nodes={highlightedNodes}
                edges={highlightedEdges}
                fitView
                attributionPosition="bottom-left"
                panOnScroll={true}
                zoomOnScroll={true}
                zoomOnPinch={true}
                zoomOnDoubleClick={true}
                nodesDraggable={true}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
            >
                <Background />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        if (node.id.startsWith("command-")) return "#2563eb";
                        if (node.id.startsWith("event-")) return "#f97316";
                        if (node.id.startsWith("policy-")) return "#c084fc";
                        return "#64748b";
                    }}
                />
            </ReactFlow>
        </div>
    );
};

export default CommandFlowVisualizer;
