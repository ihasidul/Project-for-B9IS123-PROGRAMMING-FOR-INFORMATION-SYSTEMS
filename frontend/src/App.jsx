import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  return (
    <StrictMode>
        <div>
            <h1>Welcome to the React App</h1>
            <p>This is a simple React application.</p>
        </div>
    </StrictMode>
  );
};
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);