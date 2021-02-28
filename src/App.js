import * as React from "react";
import './App.css';
import Slot from "./componets/Slot"

function App() {
  const canvasRef = React.createRef();
  const slot = Slot;
  React.useEffect(() => {
    canvasRef.current.appendChild(slot.view);
    
    return () => {
      slot.stop();
    };
  }, [canvasRef, slot]);
  return (
    <div className="App">
      <div ref={canvasRef} />
    </div>
  );
}

export default App;
