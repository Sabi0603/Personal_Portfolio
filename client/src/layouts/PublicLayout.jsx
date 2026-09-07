import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AtmosphericBackground from '../components/AtmosphericBackground';

export default function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-(--bg-primary) text-(--text-primary) transition-colors duration-200 selection:bg-cyan-500/20 selection:text-cyan-500">
      {/* Ambient Neural/Mesh Canvas */}
      <AtmosphericBackground />

      {/* Main Header Navbar */}
      <Navbar />

      {/* Page Content Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
