// Root page - redirects to /dashboard via next.config.js
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#14191E] flex items-center justify-center">
      <div className="text-center">
        <div className="text-white text-lg mb-4">Redirecting to dashboard...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
}
