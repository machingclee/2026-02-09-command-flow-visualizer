import { useEffect, useState } from "react";
import CommandFlowVisualizer from "./components/CommandFlowVisualizer";
import "./App.css";
import devCommands from "./commands.json";

function App() {
    const [commands, setCommands] = useState(
        import.meta.env.DEV ? devCommands : null
    );

    useEffect(() => {
        if (import.meta.env.DEV) return;
        fetch("/api/commands/flow")
            .then((res) => res.json())
            .then((data) => setCommands(data))
            .catch((err) => console.error("Failed to fetch commands flow:", err));
    }, []);

    if (!commands) return null;

    return (
        <div className="w-screen h-screen">
            <CommandFlowVisualizer commands={commands} />
        </div>
    );
}

export default App;
