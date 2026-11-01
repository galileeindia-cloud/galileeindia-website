import AnnouncementPopup from "@/components/AnnouncementPopup";

// Puzzle links are the site's most-visited pages, so the announcement
// shows here as well as on the homepage (still once per browser session).
export default function BiblePuzzleLayout({ children }: LayoutProps<"/bible-puzzle">) {
  return (
    <>
      <AnnouncementPopup />
      {children}
    </>
  );
}
