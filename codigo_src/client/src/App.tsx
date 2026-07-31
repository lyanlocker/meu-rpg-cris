import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpaceBackground } from "@/components/SpaceBackground";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Sheet from "@/pages/Sheet";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/character/:id" component={Sheet} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SpaceBackground />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
