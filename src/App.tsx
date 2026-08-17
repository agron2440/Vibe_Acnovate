import { Routes, Route, Navigate } from "react-router-dom";
import GeneratePage from "./pages/GeneratePage";
import { EditChart } from "./pages/EditChart";
import { useAppExtensionReady } from "./hooks/useAppExtensionReady";

export default function App() {
  useAppExtensionReady();

  return (
    <Routes>
      <Route path="/generate" element={<GeneratePage />} />
      <Route path="/edit" element={<EditChart />} />
      <Route path="*" element={<Navigate to="/edit" replace />} />
    </Routes>
  );
}
