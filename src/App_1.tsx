import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TranselevadorDetailPage from "./components/TranselevadorDetailPage";
import TranselevadorT2DetailPage from "./components/TranselevadorT2DetailPage";
import PuenteDetailPage from "./components/PuenteDetailPage";
import CTDetailPage from "./components/CTDetailPage";
import ElevadorDetailPage from "./components/ElevadorDetailPage";
import AlarmasPage from "./components/AlarmasPage";
import ControlTLV1Page from "./components/ControlTLV1Page";
import ControlTLV2Page from "./components/ControlTLV2Page";
import TestPage from "./pages/TestPage";
import DB111Page from "./pages/DB111Page";
import MonitorPage from "./pages/MonitorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/transelevador/t1" element={<TranselevadorDetailPage />} />
          <Route path="/transelevador/t2" element={<TranselevadorT2DetailPage />} />
          <Route path="/puente" element={<PuenteDetailPage />} />
          <Route path="/ct" element={<CTDetailPage />} />
          <Route path="/elevador" element={<ElevadorDetailPage />} />
          <Route path="/alarmas" element={<AlarmasPage />} />
          <Route path="/control/tlv1" element={<ControlTLV1Page />} />
          <Route path="/control/tlv2" element={<ControlTLV2Page />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/db111" element={<DB111Page />} />
          <Route path="/monitor" element={<MonitorPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
