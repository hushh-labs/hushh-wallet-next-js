import { getCurrentUser } from '@/utils/auth/anonymous'
import { 
  getFormData, 
  upsertFormData, 
  getFormCompletionStatus,
  hasFormData,
  debugFormData
} from '@/utils/forms/operations'
import { IdentityData, IdentityVisibility } from '@/types/forms'

export default async function TestSchema() {
  const user = await getCurrentUser()
  
  // Test sample identity data
  const sampleIdentityData: IdentityData = {
    full_name: "Test User",
    preferred_name: "Test",
    city: "Mumbai",
    country: "India",
    age_computed: 25
  }
  
  const sampleVisibility: IdentityVisibility = {
    full_name: "public",
    preferred_name: "public", 
    city: "public",
    country: "public",
    age: "public"
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Testing schema for user:', user.userId)
    
    try {
      // Debug current state
      await debugFormData('identity', user.userId)
      
      // Test upsert (will work once migration is pushed)
      // const result = await upsertFormData('identity', user.userId, sampleIdentityData, sampleVisibility)
      // console.log('✅ Upsert successful:', result)
      
      // Test form completion status
      // const status = await getFormCompletionStatus(user.userId)
      // console.log('📊 Form completion status:', status)
      
    } catch (error) {
      console.log('⚠️ Schema not ready yet (migration pending):', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Schema Test Page
          </h1>
          
          <div className="space-y-6">
            {/* User Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Current User
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-blue-800">
                  <span className="font-medium">User ID:</span> {user.userId}
                </p>
                <p className="text-blue-800">
                  <span className="font-medium">Hushh UID:</span> {user.hushhUid}
                </p>
              </div>
            </div>

            {/* Schema Status */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Schema Status
              </h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <p>✅ Migration files created:</p>
                <ul className="ml-4 space-y-1">
                  <li>• users_anon table</li>
                  <li>• identity_profiles table</li>
                  <li>• networth_profiles table</li>
                  <li>• bodyfit_profiles table</li>
                  <li>• food_preferences table</li>
                  <li>• lifestyle_profiles table</li>
                </ul>
                <p className="mt-3">⏳ Pending: Database migration push</p>
                <p className="text-xs">Run: <code className="bg-yellow-100 px-1 rounded">npx supabase db push</code></p>
              </div>
            </div>

            {/* Helper Functions */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Helper Functions Ready
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>✅ <code>getUserIdFromCookie(hushhUid)</code></p>
                <p>✅ <code>getFormData(formKey, userId)</code></p>
                <p>✅ <code>upsertFormData(formKey, userId, data, visibility)</code></p>
                <p>✅ <code>getFormCompletionStatus(userId)</code></p>
                <p>✅ <code>hasFormData(formKey, userId)</code></p>
                <p>✅ <code>getAllUserProfiles(userId)</code></p>
              </div>
            </div>

            {/* TypeScript Types */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                TypeScript Types Defined
              </h3>
              <div className="space-y-2 text-sm text-purple-800">
                <p>✅ All form data interfaces:</p>
                <ul className="ml-4 space-y-1">
                  <li>• IdentityData & IdentityVisibility</li>
                  <li>• NetWorthData & NetWorthVisibility</li>
                  <li>• BodyFitData & BodyFitVisibility</li>
                  <li>• FoodData & FoodVisibility</li>
                  <li>• LifestyleData & LifestyleVisibility</li>
                </ul>
                <p className="mt-3">✅ Generic helper types for operations</p>
              </div>
            </div>

            {/* Sample Data Preview */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sample Data Structure
              </h3>
              <div className="text-sm">
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{JSON.stringify({
  identity_data: sampleIdentityData,
  identity_visibility: sampleVisibility
}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                Next Steps (Step 3)
              </h3>
              <div className="space-y-2 text-sm text-indigo-800">
                <p>Ready to implement:</p>
                <ul className="ml-4 space-y-1">
                  <li>• Dashboard with form completion status</li>
                  <li>• Individual form pages</li>
                  <li>• Form data persistence</li>
                  <li>• Legacy card generation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
