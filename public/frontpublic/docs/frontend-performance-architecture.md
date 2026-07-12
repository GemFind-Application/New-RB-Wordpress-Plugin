# Frontend Performance & Architecture Analysis

## Executive Summary

This document analyzes the Ring Builder v2 React frontend architecture to identify performance bottlenecks and provide actionable recommendations to reduce bundle size and improve load time. The analysis is constrained by the requirement that production must output a **single JS file** (`assets/main.js`) and **single CSS file**, loaded via a Laravel view rendered as `application/liquid`.

**Current State:**
- Bundle size exceeds 1MB (uncompressed)
- Slow initial load time
- All route code bundled into single file
- Heavy dependencies included even when unused

**Target Improvements:**
- Reduce bundle size by 40-60% through dependency optimization
- Improve Time to Interactive (TTI) by eliminating unnecessary startup work
- Maintain single-file output constraint

---

## Current Architecture

### Entry Point Flow

```
index.jsx
  └─> BrowserRouter (basename: /apps/ringbuilder)
      └─> App.jsx
          ├─> Plan check API call
          ├─> Config fetch
          ├─> Style data fetch
          ├─> Settings navigation fetch
          └─> Routes (all eagerly imported):
              ├─> Settings
              ├─> SettingDetails
              ├─> Diamond
              ├─> DiamondPage
              ├─> Compare
              └─> Complete
```

### Key Files

1. **`src/index.jsx`** - Entry point, mounts router and App
2. **`src/App.jsx`** - Main orchestrator, handles all route imports and initial data fetching
3. **`src/vite.config.mjs`** - Build configuration (forces single-file output)
4. **`src/components/diamond-filter.jsx`** - Largest component (~3000 lines), imports MUI
5. **`src/Services/app.service.js`** - Contains module-level side effect (API call on import)

### Build Configuration Issues

**`vite.config.mjs`** currently forces all chunks into the same filename:

```javascript
output: {
  format: "es",
  entryFileNames: `assets/main.js`,
  chunkFileNames: `assets/main.js`,  // ⚠️ Forces all chunks to same name
  assetFileNames: `assets/main.[ext]`,
}
```

This configuration:
- Disables proper code splitting (even if dynamic imports are added)
- Can cause chunk name collisions
- Prevents browser caching optimization
- Still allows single-file output via `inlineDynamicImports` (safer approach)

---

## Performance Bottlenecks Identified

### 1. Heavy Dependencies (Largest Impact)

#### A. Material-UI + Emotion (~300-400KB compressed)

**Location:** `src/components/diamond-filter.jsx`

**Current Usage:**
- Only `Box` and `Slider` from `@mui/material` are imported
- Used exclusively in mobile filter modals (4 instances)
- Desktop filters use `MultiRangeSlider` (custom component)

**Impact:**
- MUI v7 + Emotion adds ~300-400KB compressed to bundle
- Includes entire styling system even though only 2 components used
- Heavy parse/execute cost on initial load

**Evidence:**
```javascript
// diamond-filter.jsx lines 12-13
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

// Used only in mobile modals (lines 1828, 1945, 2229, 2356)
<Box sx={{ width: 300 }}>
  <Slider ... />
</Box>
```

#### B. Full Lodash Import (~70KB compressed)

**Locations:**
- `src/components/diamond-filter.jsx` - imports `debounce`
- `src/components/SettingsFilterPanel.jsx` - imports `debounce`
- `src/pages/compare.jsx` - imports `remove` (unused)

**Current Usage:**
```javascript
import { debounce } from 'lodash';  // ⚠️ Imports entire lodash
import { remove } from 'lodash';    // ⚠️ Unused import
```

**Impact:**
- Full lodash library included (~70KB compressed)
- Only `debounce` function actually needed
- `remove` import in compare.jsx is unused

#### C. Unused Dependencies

**Package.json dependencies that appear unused:**
- `react-query` (^3.39.3) - Not imported anywhere in `src/`
- `dotenv` (^16.4.5) - Not needed in frontend (Vite handles env vars)
- `import` (^0.0.6) - Suspicious package, likely unused

**Test dependencies in `dependencies` (should be in `devDependencies`):**
- `@testing-library/jest-dom`
- `@testing-library/react`
- `@testing-library/user-event`
- `@types/jest`
- `@types/react`
- `@types/react-dom`

### 2. Module-Level Side Effects

#### A. Service Module API Calls

**Location:** `src/Services/app.service.js` (line 36)

**Problem:**
```javascript
async function getDomainURL(){
  // ... API call logic
}
getDomainURL();  // ⚠️ Executes on module import
```

**Also in:** `src/Services/diamond.service.js` (line 49) and `src/Services/setting.service.js` (line 49)

**Impact:**
- Triggers API calls before React even renders
- Can cause race conditions with App.jsx's explicit API calls
- Adds unnecessary network overhead during module evaluation
- Makes testing harder (side effects in imports)

### 3. Eager Route Imports

**Location:** `src/App.jsx` (lines 9-14)

**Current:**
```javascript
import Compare from "./pages/compare";
import DiamondPage from "./pages/diamond-details";
import Complete from "./pages/complete";
import Diamond from "./pages/diamond";
import Settings from "./pages/settings";
import SettingDetails from "./pages/setting-details";
```

**Impact:**
- All route code loaded upfront, even if user never visits that route
- Transitive dependencies of all routes included in initial bundle
- With single-file constraint, this is unavoidable, but we can reduce what each route imports

### 4. Large Component Files

**`src/components/diamond-filter.jsx`** - ~3000 lines
- Contains complex filter logic
- Could be split into smaller modules (but still bundled together)
- Imports heavy dependencies (MUI, lodash)

---

## Recommended Changes (Prioritized)

### Priority 1: Remove MUI/Emotion (Highest Impact)

**Expected Reduction:** ~300-400KB compressed (~40-50% of current bundle)

**Action Items:**

1. **Replace MUI Slider with rc-slider or DiscreteSegmentSlider**

   **File:** `src/components/diamond-filter.jsx`

   **Current (lines 1828-1865):**
   ```javascript
   import Box from '@mui/material/Box';
   import Slider from '@mui/material/Slider';
   
   // In mobile modal:
   <Box sx={{ width: 300 }}>
     <Slider
       value={muiPriceValue}
       onChange={...}
       // ... MUI-specific props
     />
   </Box>
   ```

   **Replace with:**
   ```javascript
   // Remove MUI imports
   // Use rc-slider (already in dependencies) or DiscreteSegmentSlider
   import Slider from 'rc-slider';
   import 'rc-slider/assets/index.css';
   
   // Replace Box with simple div
   <div style={{ width: 300 }}>
     <Slider
       range
       value={muiPriceValue}
       onChange={...}
       min={min}
       max={max}
     />
   </div>
   ```

   **Repeat for:** carat, depth, and table sliders (lines 1945, 2229, 2356)

2. **Remove MUI packages from package.json:**
   ```bash
   npm uninstall @mui/material @emotion/react @emotion/styled
   ```

3. **Update imports across codebase:**
   - Search for any other `@mui/` imports
   - Replace with lighter alternatives

**Estimated Effort:** 2-4 hours  
**Risk:** Low (MUI only used in mobile modals, desktop already uses custom sliders)

---

### Priority 2: Optimize Lodash Usage

**Expected Reduction:** ~60KB compressed

**Action Items:**

1. **Replace lodash debounce with targeted import or custom utility**

   **Files:**
   - `src/components/diamond-filter.jsx` (line 5)
   - `src/components/SettingsFilterPanel.jsx` (line 9)

   **Option A - Use lodash-es (tree-shakeable):**
   ```javascript
   // Change from:
   import { debounce } from 'lodash';
   
   // To:
   import debounce from 'lodash-es/debounce';
   ```

   **Option B - Use tiny custom debounce (recommended):**
   ```javascript
   // Create src/Helpers/debounce.js
   export function debounce(func, wait) {
     let timeout;
     return function executedFunction(...args) {
       const later = () => {
         clearTimeout(timeout);
         func(...args);
       };
       clearTimeout(timeout);
       timeout = setTimeout(later, wait);
     };
   }
   
   // Then import:
   import { debounce } from '../Helpers/debounce';
   ```

2. **Remove unused lodash import**

   **File:** `src/pages/compare.jsx` (line 10)
   ```javascript
   // Remove this line:
   import { remove } from "lodash";
   
   // Replace usage with native array methods:
   // Instead of: remove(array, item)
   // Use: array.filter(x => x !== item)
   ```

3. **Remove lodash from package.json if fully replaced:**
   ```bash
   npm uninstall lodash
   ```

**Estimated Effort:** 1-2 hours  
**Risk:** Very Low

---

### Priority 3: Remove Unused Dependencies

**Expected Reduction:** ~50-100KB (depending on packages)

**Action Items:**

1. **Remove unused packages:**
   ```bash
   npm uninstall react-query dotenv import
   ```

2. **Move test dependencies to devDependencies:**
   
   **In `package.json`, move these from `dependencies` to `devDependencies`:**
   ```json
   {
     "devDependencies": {
       "@testing-library/jest-dom": "^5.16.5",
       "@testing-library/react": "^13.4.0",
       "@testing-library/user-event": "^13.5.0",
       "@types/jest": "^29.5.0",
       "@types/react": "^18.0.28",
       "@types/react-dom": "^18.0.11"
     }
   }
   ```

**Estimated Effort:** 30 minutes  
**Risk:** Very Low (verify packages aren't used first with grep)

---

### Priority 4: Eliminate Module-Level Side Effects

**Expected Improvement:** Faster initial load, better predictability

**Action Items:**

1. **Remove top-level API calls from service modules**

   **File:** `src/Services/app.service.js`
   
   **Current (lines 22-36):**
   ```javascript
   async function getDomainURL(){
     try {
       const res = await this.getConfigSetting(); 
       // ...
     } catch (err) {       
     }
   }
   getDomainURL();  // ⚠️ Remove this
   ```

   **Fix:**
   - Remove the `getDomainURL();` call
   - Make `getDomainURL` an exported function if still needed
   - Call it explicitly from `App.jsx` after plan check, or fold logic into `getConfigSetting`

   **Repeat for:**
   - `src/Services/diamond.service.js` (line 49)
   - `src/Services/setting.service.js` (line 49)

2. **Consolidate domain URL logic**

   Since `App.jsx` already calls `getConfigSetting`, use that response to set `baseUrl` instead of separate calls.

**Estimated Effort:** 1-2 hours  
**Risk:** Low (requires testing to ensure no race conditions)

---

### Priority 5: Optimize Build Configuration

**Expected Improvement:** Better caching, safer single-file output

**Action Items:**

1. **Update `vite.config.mjs` to use `inlineDynamicImports`**

   **Current:**
   ```javascript
   rollupOptions: {
     output: {
       entryFileNames: `assets/main.js`,
       chunkFileNames: `assets/main.js`,  // ⚠️ Problematic
     }
   }
   ```

   **Improved:**
   ```javascript
   build: {
     rollupOptions: {
       output: {
         inlineDynamicImports: true,  // ✅ Forces single file safely
         format: "es",
         entryFileNames: `assets/main.js`,
         // chunkFileNames not needed when inlineDynamicImports is true
         assetFileNames: `assets/main.[ext]`,
       }
     }
   }
   ```

2. **Consider adding build analysis**

   Add `rollup-plugin-visualizer` to analyze bundle composition:
   ```bash
   npm install --save-dev rollup-plugin-visualizer
   ```

   **Update `vite.config.mjs`:**
   ```javascript
   import { visualizer } from 'rollup-plugin-visualizer';
   
   export default defineConfig({
     plugins: [
       react(),
       visualizer({
         filename: './dist/stats.html',
         open: true,
         gzipSize: true,
         brotliSize: true,
       })
     ],
     // ...
   });
   ```

**Estimated Effort:** 30 minutes  
**Risk:** Very Low

---

### Priority 6: Parallelize API Calls (Startup Performance)

**Expected Improvement:** 200-500ms faster Time to Interactive

**Action Items:**

1. **Parallelize data fetching in App.jsx**

   **Current (sequential):**
   ```javascript
   // Line 87: Plan check
   const planCheck = await appService.checkActivePlan(shop);
   
   // Line 113: Config (waits for plan)
   const res = await appService.getConfigSetting(shop);
   
   // Line 144: Style (waits for config)
   const res = await appService.getStyleData(id, shop);
   
   // Line 217: Additional options (waits for config)
   const res = await appService.getAdditionalOption(id, ...);
   ```

   **Improved (parallel after plan check):**
   ```javascript
   // Step 1: Plan check (must be first)
   const planCheck = await appService.checkActivePlan(shop);
   if (!isActive) return;
   
   // Step 2: Parallel fetch of all config-dependent data
   const [configRes, styleRes, additionRes] = await Promise.all([
     appService.getConfigSetting(shop),
     appService.getStyleData(configAppData.dealerid, shop),
     appService.getAdditionalOption(configAppData.dealerid, ...)
   ]);
   ```

   **Note:** Some calls depend on `dealerid` from config, so they can't all be parallel. But style and addition options can be parallelized.

**Estimated Effort:** 1 hour  
**Risk:** Low (requires careful dependency analysis)

---

## Implementation Plan

### Phase 1: Quick Wins (Week 1)
1. ✅ Remove unused dependencies (`react-query`, `dotenv`, `import`)
2. ✅ Move test deps to `devDependencies`
3. ✅ Remove unused `lodash` import in `compare.jsx`
4. ✅ Replace lodash debounce with custom utility or `lodash-es/debounce`

**Expected Reduction:** ~100-150KB

### Phase 2: High Impact (Week 1-2)
1. ✅ Replace MUI Slider with `rc-slider` in `diamond-filter.jsx`
2. ✅ Remove MUI/Emotion packages
3. ✅ Test mobile filter modals thoroughly

**Expected Reduction:** ~300-400KB

### Phase 3: Architecture Improvements (Week 2)
1. ✅ Remove module-level side effects from service files
2. ✅ Update build config to use `inlineDynamicImports`
3. ✅ Parallelize API calls in `App.jsx`

**Expected Improvement:** Faster startup, better maintainability

### Phase 4: Measurement & Validation (Week 2)
1. ✅ Add bundle analyzer
2. ✅ Measure before/after bundle sizes
3. ✅ Test load times in production-like environment
4. ✅ Verify all routes still work correctly

---

## Measurement Strategy

### Before Changes
1. Run `npm run build`
2. Check `build/assets/main.js` size:
   ```bash
   ls -lh build/assets/main.js
   ```
3. Check gzipped size:
   ```bash
   gzip -c build/assets/main.js | wc -c
   ```
4. Use Chrome DevTools Performance tab to measure:
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Time to Interactive (TTI)
   - Total Blocking Time (TBT)

### After Changes
1. Repeat same measurements
2. Compare bundle sizes
3. Verify functionality (especially mobile filter modals)

### Target Metrics
- **Bundle size:** < 600KB compressed (from current ~1MB+)
- **Load time:** < 2s on 3G connection
- **TTI:** < 3.5s on 3G connection

---

## File-by-File Change Summary

### `package.json`
- Remove: `@mui/material`, `@emotion/react`, `@emotion/styled`, `react-query`, `dotenv`, `import`, `lodash` (if fully replaced)
- Move to devDependencies: `@testing-library/*`, `@types/*`

### `vite.config.mjs`
- Add `inlineDynamicImports: true` to output config
- Optionally add `rollup-plugin-visualizer` for bundle analysis

### `src/components/diamond-filter.jsx`
- Remove: `import Box from '@mui/material/Box'`, `import Slider from '@mui/material/Slider'`
- Replace: MUI Slider components with `rc-slider` (4 instances in mobile modals)
- Replace: `import { debounce } from 'lodash'` with custom debounce or `lodash-es/debounce`

### `src/components/SettingsFilterPanel.jsx`
- Replace: `import { debounce } from "lodash"` with custom debounce or `lodash-es/debounce`

### `src/pages/compare.jsx`
- Remove: `import { remove } from "lodash"`
- Replace: `remove(array, item)` usage with `array.filter(x => x !== item)`

### `src/Services/app.service.js`
- Remove: Top-level `getDomainURL();` call (line 36)
- Make `getDomainURL` an exported function if still needed elsewhere

### `src/Services/diamond.service.js`
- Remove: Top-level `getDomainURL();` call (line 49)

### `src/Services/setting.service.js`
- Remove: Top-level `getDomainURL();` call (line 49)

### `src/App.jsx`
- Parallelize: API calls after plan check where possible
- Consider: Consolidating domain URL logic to avoid duplicate config fetches

---

## Risk Assessment

### Low Risk Changes
- Removing unused dependencies
- Moving test deps to devDependencies
- Removing unused imports
- Updating build config

### Medium Risk Changes
- Replacing MUI Slider (requires thorough mobile testing)
- Removing module-level side effects (requires testing all routes)

### Mitigation Strategies
1. **Feature flags:** Keep old code behind a flag during transition
2. **Incremental rollout:** Make changes one at a time, test after each
3. **Comprehensive testing:** Test all routes, especially mobile filter modals
4. **Rollback plan:** Keep previous build artifacts for quick rollback

---

## Additional Recommendations (Future)

### Code Splitting (If Constraint Changes)
If the single-file constraint is ever relaxed:
1. Use React.lazy() for route-level code splitting
2. Split vendor chunks (react, react-dom, etc.)
3. Lazy load heavy components (image galleries, modals)

### Image Optimization
- Use WebP format with fallbacks
- Implement lazy loading for product images
- Consider using `<img loading="lazy">` or Intersection Observer

### CSS Optimization
- Remove unused CSS (consider PurgeCSS)
- Split CSS by route if possible
- Minimize custom CSS in favor of utility classes

### Runtime Performance
- Memoize expensive computations in `diamond-filter.jsx`
- Use React.memo for expensive components
- Virtualize long lists if needed

---

## Conclusion

By implementing the Priority 1-3 changes (removing MUI, optimizing lodash, cleaning dependencies), you can expect a **40-60% reduction in bundle size** (from ~1MB to ~400-600KB compressed). This should significantly improve load times while maintaining the single-file output constraint.

The Priority 4-6 changes will improve startup performance and code maintainability, making future optimizations easier.

**Estimated Total Effort:** 1-2 weeks  
**Expected Impact:** 40-60% smaller bundle, 30-50% faster load time

---

## Appendix: Dependency Analysis

### Current Heavy Dependencies (Top 10 by size)
1. `@mui/material` + `@emotion/*` - ~300-400KB (can be removed)
2. `react` + `react-dom` - ~130KB (unavoidable)
3. `react-router-dom` - ~50KB (needed)
4. `lodash` - ~70KB (can be optimized)
5. `react-image-gallery` - ~30KB (used in diamond-details, complete)
6. `nouislider-react` - ~25KB (used in filters)
7. `rc-slider` - ~20KB (already in deps, can replace MUI)
8. `axios` - ~15KB (used in http-common)
9. `lucide-react` - ~10KB (icons, tree-shakeable)
10. `react-datepicker` - ~20KB (used in ScheduleViewingPopup)

### Unused Dependencies
- `react-query` - Not imported
- `dotenv` - Not needed (Vite handles env)
- `import` - Suspicious, likely unused

---

*Last Updated: February 17, 2026*
