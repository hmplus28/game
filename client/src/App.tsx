import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ClassicGamesPage from "./pages/ClassicGamesPage";
import { Friends, Leaderboard, Leagues, Profile, Promo, Rewards, Season, SettingsPage, Shop, Tournaments } from "./pages/Views";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/play"} component={ClassicGamesPage} />
      <Route path={"/leagues"} component={Leagues} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/season"} component={Season} />
      <Route path={"/rewards"} component={Rewards} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/friends"} component={Friends} />
      <Route path={"/tournaments"} component={Tournaments} />
      <Route path={"/promo"} component={Promo} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/settings"} component={SettingsPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
