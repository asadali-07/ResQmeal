import { BrowserRouter } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
