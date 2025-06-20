import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ProductTable from "./ProductTable.jsx";


const App = () => {
  return (
    <StrictMode>
        <div>
            <ProductTable />
        </div>
    </StrictMode>
  );
};
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);