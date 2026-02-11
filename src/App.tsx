import CommandFlowVisualizer from "./components/CommandFlowVisualizer";
import "./App.css";
import commands from "./commands.json";

function App() {
    return (
        <div className="w-screen h-screen">
            <CommandFlowVisualizer commands={commands} />
        </div>
    );
}

export default App;
