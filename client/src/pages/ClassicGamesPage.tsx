/** Mobile-first classic game container for Ludo and Snakes & Ladders. */
import { AppShell } from "@/components/AppShell";
import { ClassicGames } from "@/components/ClassicGames";

export default function ClassicGamesPage() {
  return <AppShell title="مار و پله" eyebrow="مسیر رقابت"><ClassicGames /></AppShell>;
}
