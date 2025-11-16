'use client';
import { useState } from 'react';

interface TestResult {
  success: boolean;
  message?: string;
  testResults?: {
    certificates: boolean;
    passModel: boolean;
    pkpassCreation: boolean;
    bufferGeneration: boolean;
    downloadReady: boolean;
  };
  passInfo?: {
    serialNumber: string;
    bufferSize: number;
    teamIdentifier: string;
    passTypeIdentifier: string;
    organizationName: string;
    description: string;
  };
  steps?: string[];
  error?: string;
  details?: any;
}

export default function TestDashboardPage() {
  const [isTestingSystem, setIsTestingSystem] = useState(false);
  const [isGeneratingPass, setIsGeneratingPass] = useState(false);
  const [systemTestResult, setSystemTestResult] = useState<TestResult | null>(null);
  const [formData, setFormData] = useState({
    name: 'Test User',
    email: 'test@hushh.ai',
    preferences: ['Italian', 'Japanese', 'Vegetarian']
  });

  const runSystemTest = async () => {
    setIsTestingSystem(true);
    setSystemTestResult(null);
    
    try {
      const response = await fetch('/api/test-pkpass', {
        method: 'GET'
      });
      
      const result = await response.json();
      setSystemTestResult(result);
    } catch (error) {
      console.error('System test failed:', error);
      setSystemTestResult({
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsTestingSystem(false);
    }
  };

  const generateTestPass = async () => {
    setIsGeneratingPass(true);
    
    try {
      const response = await fetch('/api/test-pkpass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // If response is a pkpass file, trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HushhTestPass-${Date.now()}.pkpass`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('✅ PKPass generated and downloaded successfully!');
      } else {
        const errorResult = await response.json();
        console.error('Pass generation failed:', errorResult);
        alert(`❌ Pass generation failed: ${errorResult.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Pass generation error:', error);
      alert(`❌ Network error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGeneratingPass(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'preferences') {
      setFormData(prev => ({
        ...prev,
        preferences: value.split(',').map(p => p.trim()).filter(Boolean)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getStatusBadge = (status: boolean | undefined) => {
    if (status === undefined) return <span className="badge badge-pending">PENDING</span>;
    return status 
      ? <span className="badge badge-success">✅ PASS</span>
      : <span className="badge badge-error">❌ FAIL</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PKPass Testing Dashboard</h1>
          <p className="text-gray-600">Test Apple Wallet pass (.pkpass) generation and download functionality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Test Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔧 System Test</h2>
            <p className="text-gray-600 mb-6">Run comprehensive tests to verify all PKPass components are working.</p>
            
            <button
              onClick={runSystemTest}
              disabled={isTestingSystem}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isTestingSystem
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isTestingSystem ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚙️</span>
                  Running System Test...
                </>
              ) : (
                '🧪 Run System Test'
              )}
            </button>

            {/* System Test Results */}
            {systemTestResult && (
              <div className="mt-6">
                <div className={`p-4 rounded-lg ${
                  systemTestResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">
                      {systemTestResult.success ? '✅' : '❌'}
                    </span>
                    <h3 className="text-lg font-semibold">
                      {systemTestResult.success ? 'All Tests Passed!' : 'Tests Failed'}
                    </h3>
                  </div>
                  
                  {systemTestResult.message && (
                    <p className="text-sm text-gray-700 mb-3">{systemTestResult.message}</p>
                  )}

                  {/* Test Steps */}
                  {systemTestResult.testResults && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">📁 Certificate Loading</span>
                        {getStatusBadge(systemTestResult.testResults.certificates)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">📄 Pass Model Loading</span>
                        {getStatusBadge(systemTestResult.testResults.passModel)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">🎫 PKPass Creation</span>
                        {getStatusBadge(systemTestResult.testResults.pkpassCreation)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">📦 Buffer Generation</span>
                        {getStatusBadge(systemTestResult.testResults.bufferGeneration)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">⬇️ Download Ready</span>
                        {getStatusBadge(systemTestResult.testResults.downloadReady)}
                      </div>
                    </div>
                  )}

                  {/* Pass Info */}
                  {systemTestResult.passInfo && (
                    <div className="mt-4 p-3 bg-white rounded border">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Pass Information:</h4>
                      <div className="text-xs space-y-1 text-gray-600">
                        <div><strong>Serial:</strong> {systemTestResult.passInfo.serialNumber}</div>
                        <div><strong>Size:</strong> {systemTestResult.passInfo.bufferSize} bytes</div>
                        <div><strong>Team ID:</strong> {systemTestResult.passInfo.teamIdentifier}</div>
                        <div><strong>Pass Type:</strong> {systemTestResult.passInfo.passTypeIdentifier}</div>
                        <div><strong>Organization:</strong> {systemTestResult.passInfo.organizationName}</div>
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {systemTestResult.error && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
                      <h4 className="font-medium text-sm text-red-800">Error Details:</h4>
                      <p className="text-xs text-red-700 mt-1">{systemTestResult.error}</p>
                      {systemTestResult.details && (
                        <pre className="text-xs text-red-600 mt-2 overflow-auto">
                          {typeof systemTestResult.details === 'object' 
                            ? JSON.stringify(systemTestResult.details, null, 2)
                            : String(systemTestResult.details)
                          }
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pass Generation Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎫 Generate Test Pass</h2>
            <p className="text-gray-600 mb-6">Create and download a custom .pkpass file with your test data.</p>
            
            {/* Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferences (comma-separated)
                </label>
                <input
                  type="text"
                  id="preferences"
                  value={formData.preferences.join(', ')}
                  onChange={(e) => handleInputChange('preferences', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Italian, Japanese, Vegetarian"
                />
              </div>
            </div>

            <button
              onClick={generateTestPass}
              disabled={isGeneratingPass}
              className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-colors ${
                isGeneratingPass
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isGeneratingPass ? (
                <>
                  <span className="inline-block animate-spin mr-2">⚙️</span>
                  Generating Pass...
                </>
              ) : (
                '⬇️ Generate & Download PKPass'
              )}
            </button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">📱 Testing Instructions:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• On iOS: Downloaded .pkpass files will open in Apple Wallet</li>
                <li>• On Desktop: Files will download to your Downloads folder</li>
                <li>• Transfer to iOS device to test Apple Wallet integration</li>
                <li>• Each pass has a unique serial number for tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This dashboard tests the Apple Wallet (.pkpass) generation system. 
            Use this to verify that certificates are properly configured and passes can be generated.
          </p>
        </div>
      </div>

      <style jsx>{`
        .badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-success {
          background-color: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        .badge-error {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .badge-pending {
          background-color: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }
      `}</style>
    </div>
  );
}
