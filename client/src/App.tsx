import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ClassicGamesPage from "./pages/ClassicGamesPage";
import NotFound from "./pages/NotFound";
import { Leaderboard, Leagues, Rewards, Season } from "./pages/Views";

function Router() {
  return <Switch><Route path="/" component={ClassicGamesPage} /><Route path="/play" component={ClassicGamesPage} /><Route path="/leagues" component={Leagues} /><Route path="/leaderboard" component={Leaderboard} /><Route path="/season" component={Season} /><Route path="/rewards" component={Rewards} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
