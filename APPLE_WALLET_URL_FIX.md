# Apple Wallet URL Link Fix

## Problem Summary

In Apple Wallet passes, URLs in the back fields were appearing **partially clickable** - only the domain portion was blue/tappable, while the path portion appeared as grey non-clickable text. This was causing user experience issues where users couldn't properly access profile completion and verification links.

### Screenshot Evidence
```
✅ Clickable (blue):   https://hushh-gold-pass-mvp.vercel.app
❌ Non-clickable (grey): /s/f79d8f35
```

## Root Cause Analysis

Based on Apple Wallet documentation and research:

1. **Apple's NSDataDetector** scans back field text for URLs and makes them clickable
2. **Data detector stops at whitespace** - any `\n`, `\r`, `\t`, or space breaks the URL detection
3. **URLs must be continuous strings** for full clickability
4. **UTF-8 encoding** is preferred over iso-8859-1

### Issues Found

1. **URLs with embedded newlines**: Database/templating was creating URLs like:
   ```
   https://hushh-gold-pass-mvp.vercel.app\n/s/f79d8f35
   ```

2. **Wrong encoding**: Barcode was using `iso-8859-1` instead of `utf-8`

3. **No URL sanitization**: Raw URLs from database were passed directly to Apple Wallet API

## Solution Implementation

### 1. URL Sanitization Function

Added `sanitizeUrlForAppleWallet()` function in `/src/app/api/passes/gold/route.ts`:

```javascript
function sanitizeUrlForAppleWallet(url: string): string {
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
```

### 2. Applied to Pass Payload

Updated pass generation to use sanitized URLs:

```javascript
// Back fields - profile completion link (clickable URLs)
backFields: [
  {
    key: "profile",
    label: "Complete your profile",
    value: sanitizeUrlForAppleWallet(member.profile_url), // ✅ FIXED
    dataDetectorTypes: ["PKDataDetectorTypeLink"],
    textAlignment: "PKTextAlignmentLeft"
  },
  {
    key: "verify",
    label: "Verification",
    value: sanitizeUrlForAppleWallet(member.public_url), // ✅ FIXED
    dataDetectorTypes: ["PKDataDetectorTypeLink"],
    textAlignment: "PKTextAlignmentLeft"
  }
],

// Barcode/QR Code
barcode: {
  message: sanitizeUrlForAppleWallet(member.public_url), // ✅ FIXED
  format: "PKBarcodeFormatQR",
  messageEncoding: "utf-8", // ✅ FIXED (was iso-8859-1)
  altText: `HUSHH Gold Pass - ${uid}`
},
```

### 3. Testing

Created comprehensive test suite in `/scripts/test-url-sanitization.js` that validates:

- ✅ URLs with newlines (main issue)
- ✅ URLs with spaces
- ✅ URLs with tabs
- ✅ URLs with multiple whitespace types
- ✅ Clean URLs (remain unchanged)
- ✅ URLs with leading/trailing spaces

**All tests pass**: 6 passed, 0 failed

## Expected Results

After this fix:

1. **Full URL clickability**: Entire URLs in back fields should be blue and tappable
2. **Better user experience**: Users can easily access profile completion and verification links
3. **Proper encoding**: QR codes use UTF-8 for better international compatibility
4. **Robust URL handling**: Whitespace issues won't break links in the future

## Technical Details

### Apple Wallet Data Detector Behavior

Apple's documentation confirms:
> "Wallet uses data detectors to add links for text shown on the back of the pass."

Data detectors work by:
1. Scanning text for URL patterns
2. Making detected URLs clickable
3. **Stopping at first whitespace character**
4. Supporting both raw URLs and HTML `<a>` tags

### Alternative Approaches Considered

1. **HTML anchor tags**: `<a href="...">Label</a>` - valid but overkill for this use case
2. **Short URLs**: Would help but doesn't fix root cause
3. **Database schema changes**: More invasive than sanitization approach

## Files Modified

- ✅ `/src/app/api/passes/gold/route.ts` - Main fix
- ✅ `/scripts/test-url-sanitization.js` - Test suite
- ✅ `/APPLE_WALLET_URL_FIX.md` - Documentation

## Deployment Notes

- No database migrations required
- No breaking changes to API
- Backward compatible with existing passes
- Takes effect immediately for new pass generations

---

## References

- [Apple Developer - PassFieldContent](https://developer.apple.com/documentation/walletpasses/passfieldcontent)
- [Apple Wallet Link Best Practices](https://help.passkit.com/en/articles/6258385-how-to-add-links-on-passes)
- [NSDataDetector Documentation](https://developer.apple.com/documentation/foundation/nsdatadetector)
