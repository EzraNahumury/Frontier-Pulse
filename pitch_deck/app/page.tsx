import StarField from "./components/StarField";
import ScrollProgress from "./components/ScrollProgress";
import SideNav from "./components/SideNav";
import ScrollToTop from "./components/ScrollToTop";
import CursorGlow from "./components/CursorGlow";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Solution from "./components/Solution";
import Architecture from "./components/Architecture";
import Features from "./components/Features";
import Demo from "./components/Demo";
import TechStack from "./components/TechStack";
import HackathonEdge from "./components/HackathonEdge";
import Roadmap from "./components/Roadmap";
import CTA from "./components/CTA";

export default function Home() {
  return (
    <>
      <StarField />
      <ScrollProgress />
      <SideNav />
      <ScrollToTop />
      <CursorGlow />
      <main className="relative z-10">
        <Hero />
        <Problem />
        <Solution />
        <Architecture />
        <Features />
        <Demo />
        <TechStack />
        <HackathonEdge />
        <Roadmap />
        <CTA />
      </main>
    </>
  );
}
