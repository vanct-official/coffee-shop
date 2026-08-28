import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AiAssistantWidget from "./AiAssistantWidget";

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full bg-background">
        <Outlet />
      </main>
      <AiAssistantWidget />
      <Footer />
    </div>
  );
}
