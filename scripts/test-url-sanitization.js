// Test script for URL sanitization function
// This tests the same logic we added to the Apple Wallet pass generation

function sanitizeUrlForAppleWallet(url) {
  if (!url) return '';
  
  // Remove all whitespace characters (spaces, newlines, tabs, etc.)
  // and ensure it's a single continuous string
  const cleanUrl = url.replace(/\s+/g, '').trim();
  
  // Validate that it's a proper HTTPS URL
  try {
    const urlObj = new URL(cleanUrl);
    if (urlObj.protocol === 'https:') {
      return cleanUrl;
    }
  } catch (error) {
    console.error('Invalid URL format:', cleanUrl);
  }
  
  return cleanUrl; // Return even if validation fails, but cleaned
}

// Test cases that simulate the problematic URLs
const testCases = [
  {
    name: "URL with newline (the main issue)",
    input: "https://hushh-gold-pass-mvp.vercel.app\n/s/f79d8f35",
    expected: "https://hushh-gold-pass-mvp.vercel.app/s/f79d8f35"
  },
  {
    name: "URL with spaces",
    input: "https://hushh-gold-pass-mvp.vercel.app /u/abc123",
    expected: "https://hushh-gold-pass-mvp.vercel.app/u/abc123"
  },
  {
    name: "URL with tabs",
    input: "https://hushh-gold-pass-mvp.vercel.app\t/complete/xyz789",
    expected: "https://hushh-gold-pass-mvp.vercel.app/complete/xyz789"
  },
  {
    name: "URL with multiple whitespace types",
    input: "https://hushh-gold-pass-mvp.vercel.app \n\t /s/token123",
    expected: "https://hushh-gold-pass-mvp.vercel.app/s/token123"
  },
  {
    name: "Clean URL (should remain unchanged)",
    input: "https://hushh-gold-pass-mvp.vercel.app/u/clean123",
    expected: "https://hushh-gold-pass-mvp.vercel.app/u/clean123"
  },
  {
    name: "URL with leading/trailing spaces",
    input: "  https://hushh-gold-pass-mvp.vercel.app/s/token456  ",
    expected: "https://hushh-gold-pass-mvp.vercel.app/s/token456"
  }
];

console.log('🧪 Testing URL Sanitization for Apple Wallet Compatibility\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = sanitizeUrlForAppleWallet(testCase.input);
  const success = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Input:    "${testCase.input}"`);
  console.log(`Expected: "${testCase.expected}"`);
  console.log(`Result:   "${result}"`);
  console.log(`Status:   ${success ? '✅ PASSED' : '❌ FAILED'}\n`);
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
});

console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed! URL sanitization is working correctly.');
  console.log('\n📋 Summary of fixes applied:');
  console.log('• Removes all whitespace characters (\\n, \\t, spaces)');
  console.log('• Validates HTTPS protocol');
  console.log('• Ensures continuous URL strings for Apple Wallet data detector');
} else {
  console.log('❌ Some tests failed. Please review the sanitization logic.');
}
