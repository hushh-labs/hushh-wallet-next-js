export default function HealthCheck() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">✅ Deployment Success</h1>
        <p className="text-gray-600 mb-4">
          Hushh One Login system is deployed with Vend Sans + Saira fonts.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm font-mono">
            Build completed successfully<br/>
            Environment: {process.env.NODE_ENV}<br/>
            Font: Vend Sans + Saira active
          </p>
        </div>
        <div className="mt-6">
          <a 
            href="/"
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
