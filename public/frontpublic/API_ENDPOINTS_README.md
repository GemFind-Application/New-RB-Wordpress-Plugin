# API Endpoints Documentation - RingBuilder React Application

This document provides a comprehensive list of all API endpoints used in the RingBuilder React application. The application uses multiple base URLs and services for different functionalities.

## Base URLs and Environment Variables

The application uses the following environment variables for different API endpoints:

- `VITE_APP_API_URL` = `http://api.jewelcloud.com/api/RingBuilder` - Main RingBuilder API base URL
- `VITE_APP_FORM_API_URL` = `https://gemfind.org/ringbuilder` - Forms and configuration API base URL  
- `VITE_APP_API_VIDEOURL` = `http://api.jewelcloud.com/api/jewelry/GetVideoUrl` - Video API base URL
- `VITE_SHOP_EXTENSION` = `/apps/ringbuilder` - Shop extension path
- `VITE_ADD_TO_CART_PREFIX` = `diamondtools/cartadd` - Add to cart API prefix
- `VITE_ADD_TO_CART_COMPLETE_PURCHASE_PREFIX` = `diamondtools/completepurchase` - Complete purchase API prefix
- `VITE_IMAGE_URL` = `https://gemfind.org/public/react/newbuild` - Image assets base URL
- `VITE_DIAMOND_DETAIL_PAGE` = `diamondtools/product` - Diamond detail page URL
- `VITE_SETTINGS_DETAIL_PAGE` = `settings/view/path` - Settings detail page URL
- `VITE_RING_URL_EXT` = `/apps/ringbuilder` - Ring URL extension

## Environment Variables List and Explanations

### 1. **VITE_APP_API_URL** = `http://api.jewelcloud.com/api/RingBuilder`
**Purpose**: Main API endpoint for all RingBuilder core functionality
**Usage**: Used for diamond management, settings management, and core application data
**Examples**: 
- Diamond filtering: `http://api.jewelcloud.com/api/RingBuilder/GetDiamondFilter`
- Settings listing: `http://api.jewelcloud.com/api/RingBuilder/GetMountingList`
- Navigation data: `http://api.jewelcloud.com/api/RingBuilder/GetNavigation`

### 2. **VITE_APP_FORM_API_URL** = `https://gemfind.org/ringbuilder`
**Purpose**: Forms and configuration API for user interactions and app settings
**Usage**: Handles form submissions, configuration data, and user-generated content
**Examples**:
- Configuration: `https://gemfind.org/ringbuilder/reactconfig`
- Style data: `https://gemfind.org/ringbuilder/reactconfig/getcssStyle`
- Diamond details: `https://gemfind.org/ringbuilder/reactconfig/GetDiamondDetail`

### 3. **VITE_APP_API_VIDEOURL** = `http://api.jewelcloud.com/api/jewelry/GetVideoUrl`
**Purpose**: Video content API for product videos
**Usage**: Retrieves video URLs for diamonds and jewelry settings
**Examples**:
- Diamond videos: `http://api.jewelcloud.com/api/jewelry/GetVideoUrl?InventoryID=123&Type=Diamond`
- Setting videos: `http://api.jewelcloud.com/api/jewelry/GetVideoUrl?InventoryID=456&Type=Jewelry`

### 4. **VITE_SHOP_EXTENSION** = `/apps/ringbuilder`
**Purpose**: Shopify app extension path for e-commerce integration
**Usage**: Used to construct URLs for cart operations and shop-specific functionality
**Examples**:
- Add to cart: `{shop_domain}/apps/ringbuilder/diamondtools/cartadd`
- Complete purchase: `{shop_domain}/apps/ringbuilder/diamondtools/completepurchase`

### 5. **VITE_ADD_TO_CART_PREFIX** = `diamondtools/cartadd`
**Purpose**: API endpoint prefix for adding items to cart
**Usage**: Combined with shop URL to create add-to-cart functionality
**Full URL Example**: `https://shop.myshopify.com/apps/ringbuilder/diamondtools/cartadd/{diamondId}/{settingId}`

### 6. **VITE_ADD_TO_CART_COMPLETE_PURCHASE_PREFIX** = `diamondtools/completepurchase`
**Purpose**: API endpoint prefix for completing purchases
**Usage**: Combined with shop URL to redirect users to checkout
**Full URL Example**: `https://shop.myshopify.com/apps/ringbuilder/diamondtools/completepurchase/{diamondId}/{settingId}`

### 7. **VITE_IMAGE_URL** = `https://gemfind.org/public/react/newbuild`
**Purpose**: Base URL for all static image assets
**Usage**: Used throughout the application to load product images, icons, and UI assets
**Examples**:
- Product images: `https://gemfind.org/public/react/newbuild/images/diamond.jpg`
- UI icons: `https://gemfind.org/public/react/newbuild/icons/filter.svg`

### 8. **VITE_DIAMOND_DETAIL_PAGE** = `diamondtools/product`
**Purpose**: URL path for diamond detail pages
**Usage**: Used to construct links to individual diamond product pages
**Full URL Example**: `https://shop.myshopify.com/apps/ringbuilder/diamondtools/product/{diamondId}`

### 9. **VITE_SETTINGS_DETAIL_PAGE** = `settings/view/path`
**Purpose**: URL path for ring settings detail pages
**Usage**: Used to construct links to individual ring setting pages
**Full URL Example**: `https://shop.myshopify.com/apps/ringbuilder/settings/view/path/{settingId}`

### 10. **VITE_RING_URL_EXT** = `/apps/ringbuilder`
**Purpose**: Ring URL extension for email and sharing functionality
**Usage**: Used in email templates and sharing features to provide proper URLs
**Examples**:
- Email links: `https://shop.myshopify.com/apps/ringbuilder/diamondtools/product/123`
- Share URLs: `https://shop.myshopify.com/apps/ringbuilder/settings/view/path/456`

### 11. **VITE_ADD_TO_CART** (Commented) = `https://gemfind-product-demo-10.myshopify.com/apps/ringbuilderdev`
**Purpose**: Development/testing shop URL for add-to-cart functionality
**Usage**: Used during development and testing phases
**Status**: Currently commented out, likely used for testing purposes

## API Endpoints by Category

### 1. Configuration & App Settings

#### Get Configuration Settings
- **Endpoint**: `{shop_domain}/apps/ringbuilder/reactconfig`
- **Method**: GET
- **Service**: `appService.getConfigSetting()`
- **Description**: Retrieves application configuration settings
- **Parameters**: None

#### Get Style Data
- **Endpoint**: `https://gemfind.org/ringbuilder/reactconfig/getcssStyle?shop={shop}`
- **Method**: GET
- **Service**: `appService.getStyleData(dealerId, shop)`
- **Description**: Retrieves CSS styling configuration for the shop
- **Parameters**: 
  - `shop` (string): Shop identifier

#### Get Additional Options
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetDiamondsJCOptions?DealerId={dealerId}`
- **Method**: GET
- **Service**: `appService.getAdditionalOption(dealerId, url)`
- **Description**: Retrieves additional diamond options for jewelry configuration
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `url` (string): Base URL for the request

### 2. Diamond Management

#### Get Diamond Filter
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetDiamondFilter?DealerId={dealerId}&IsLabGrown={isLabGrown}`
- **Method**: GET
- **Service**: `diamondService.getDiamondFilter(option, dealerId)`
- **Description**: Retrieves diamond filter options
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `isLabGrown` (boolean): Whether to filter for lab-grown diamonds

#### Get Initial Filter
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetInitialFilter?DealerId={dealerId}&IsLabGrown={isLabGrown}`
- **Method**: GET
- **Service**: `diamondService.getDiamondFilter(option, dealerId)`
- **Description**: Retrieves initial diamond filter options
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `isLabGrown` (boolean): Whether to filter for lab-grown diamonds

#### Get Fancy Diamond Filter
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetColorDiamondFilter?DealerId={dealerId}`
- **Method**: GET
- **Service**: `diamondService.getFancyDiamondFilter(option, settingId, dealerId)`
- **Description**: Retrieves fancy colored diamond filter options
- **Parameters**:
  - `dealerId` (number): Dealer identifier

#### Get All Diamonds
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetDiamond?DealerId={dealerId}{queryParam}`
- **Method**: GET
- **Service**: `diamondService.getAllDiamond(option, dealerId)`
- **Description**: Retrieves list of diamonds with filtering options
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `queryParam` (string): Query parameters for filtering (pagination, search, filters)

#### Get Color Diamonds
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetColorDiamond?DealerId={dealerId}{queryParam}&IsLabGrown=false`
- **Method**: GET
- **Service**: `diamondService.getAllDiamond(option, dealerId)`
- **Description**: Retrieves list of fancy colored diamonds
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `queryParam` (string): Query parameters for filtering

#### Get Diamond Detail
- **Endpoint**: `https://gemfind.org/ringbuilder/reactconfig/GetDiamondDetail?DealerId={dealerId}&DID={diamondId}&shop={shop}`
- **Method**: GET
- **Service**: `diamondService.getDiamondDetail(diamondId, isLabGrown, dealerId, shop)`
- **Description**: Retrieves detailed information about a specific diamond
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `diamondId` (string): Diamond identifier
  - `shop` (string): Shop identifier
  - `isLabGrown` (string): Lab-grown type ('labcreated', 'fancydiamonds', or false)

#### Get Diamond Navigation
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetNavigation?DealerId={dealerId}`
- **Method**: GET
- **Service**: `diamondService.getDiamondNavigation(dealerId)`
- **Description**: Retrieves diamond navigation menu structure
- **Parameters**:
  - `dealerId` (number): Dealer identifier

#### Get Diamond Video URL
- **Endpoint**: `http://api.jewelcloud.com/api/jewelry/GetVideoUrl?InventoryID={diamondId}&Type=Diamond`
- **Method**: GET
- **Service**: `diamondService.getDiamondVideoUrl(diamondId)`
- **Description**: Retrieves video URL for a specific diamond
- **Parameters**:
  - `diamondId` (string): Diamond identifier

### 3. Settings/Rings Management

#### Get Setting Filters
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetFilters?DealerId={dealerId}{queryParam}`
- **Method**: GET
- **Service**: `settingService.getSettingFilters(option, dealerId)`
- **Description**: Retrieves filter options for ring settings
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `queryParam` (string): Query parameters for filtering

#### Get All Settings
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetMountingList?DealerId={dealerId}{queryParam}`
- **Method**: GET
- **Service**: `settingService.getAllSettings(option, dealerId)`
- **Description**: Retrieves list of ring settings with filtering options
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `queryParam` (string): Query parameters for filtering (pagination, search, filters)

#### Get Setting Detail
- **Endpoint**: `https://gemfind.org/ringbuilder/reactconfig/GetMountingDetail?DealerId={dealerId}&SID={settingId}&shop={shop}`
- **Method**: GET
- **Service**: `settingService.getSettingDetail(settingId, dealerId, isLabGrown, shop)`
- **Description**: Retrieves detailed information about a specific ring setting
- **Parameters**:
  - `dealerId` (number): Dealer identifier
  - `settingId` (string): Setting identifier
  - `shop` (string): Shop identifier
  - `isLabGrown` (boolean): Whether it's a lab-grown setting

#### Get Setting Navigation
- **Endpoint**: `http://api.jewelcloud.com/api/RingBuilder/GetRBNavigation?DealerId={dealerId}`
- **Method**: GET
- **Service**: `settingService.getSettingNavigation(dealerId)`
- **Description**: Retrieves ring builder navigation menu structure
- **Parameters**:
  - `dealerId` (number): Dealer identifier

#### Get Setting Video URL
- **Endpoint**: `http://api.jewelcloud.com/api/jewelry/GetVideoUrl?InventoryID={settingId}&Type=Jewelry`
- **Method**: GET
- **Service**: `settingService.getSettingVideoUrl(settingId)`
- **Description**: Retrieves video URL for a specific ring setting
- **Parameters**:
  - `settingId` (string): Setting identifier

### 4. Form Submissions & User Actions

#### Drop a Hint
- **Endpoint**: `https://gemfind.org/ringbuilder/{sendRequest}/{apiCall}`
- **Method**: POST (FormData)
- **Service**: `settingService.dropAHint(formData, sendRequest, apiCall)`
- **Description**: Submits drop a hint form
- **Parameters**:
  - `sendRequest` (string): Request type ('settings' or 'diamondtools')
  - `apiCall` (string): API call identifier
  - `formData` (FormData): Form data including user details

#### Send Email to Friend
- **Endpoint**: `https://gemfind.org/ringbuilder/{sendRequest}/{apiCall}`
- **Method**: POST (FormData)
- **Service**: `settingService.friendsEmail(formData, sendRequest, apiCall)`
- **Description**: Sends email to friend about a product
- **Parameters**:
  - `sendRequest` (string): Request type ('settings' or 'diamondtools')
  - `apiCall` (string): API call identifier ('resultemailfriend' or 'resultemailfriend_cr')
  - `formData` (FormData): Form data including email details

#### Validate Dealer Password
- **Endpoint**: `https://gemfind.org/ringbuilder/{page}/authenticate`
- **Method**: POST (FormData)
- **Service**: `settingService.validateDealerPassword(data, page)`
- **Description**: Authenticates dealer password for protected areas
- **Parameters**:
  - `page` (string): Page type ('setting' or 'diamondtools')
  - `data` (FormData): Authentication data

#### Schedule Viewing
- **Endpoint**: `https://gemfind.org/ringbuilder/{sendRequest}/{apiCall}`
- **Method**: POST (FormData)
- **Service**: `settingService.scheduleViewing(formData, sendRequest, apiCall)`
- **Description**: Schedules a viewing appointment
- **Parameters**:
  - `sendRequest` (string): Request type ('settings' or 'diamondtools')
  - `apiCall` (string): API call identifier
  - `formData` (FormData): Form data including scheduling details

#### Request More Info
- **Endpoint**: `https://gemfind.org/ringbuilder/{sendRequest}/{apiCall}`
- **Method**: POST (FormData)
- **Service**: `settingService.requestMoreInfo(formData, sendRequest, apiCall)`
- **Description**: Requests more information about a product
- **Parameters**:
  - `sendRequest` (string): Request type ('settings' or 'diamondtools')
  - `apiCall` (string): API call identifier ('resultreqinfo' or 'resultreqinfo_cr')
  - `formData` (FormData): Form data including request details

### 5. E-commerce & Cart Operations

#### Add to Cart
- **Endpoint**: `{shop_domain}/apps/ringbuilder/diamondtools/cartadd/{diamondId}/{settingId}`
- **Method**: POST (FormData)
- **Service**: Direct fetch call in components
- **Description**: Adds diamond and setting combination to cart
- **Parameters**:
  - `diamondId` (string): Diamond identifier
  - `settingId` (string): Setting identifier
  - Form data including metal type, ring size, etc.

#### Complete Purchase
- **Endpoint**: `{shop_domain}/apps/ringbuilder/diamondtools/completepurchase/{diamondId}/{settingId}`
- **Method**: POST (FormData)
- **Service**: Direct fetch call in components
- **Description**: Completes purchase and redirects to checkout
- **Parameters**:
  - `diamondId` (string): Diamond identifier
  - `settingId` (string): Setting identifier
  - Form data including purchase details

### 6. Print & Document Generation

#### Print Diamond Document
- **Endpoint**: `https://gemfind.org/ringbuilder/diamondtools/printdiamond`
- **Method**: POST (FormData)
- **Service**: Direct fetch call in diamond-details.jsx
- **Description**: Generates printable document for diamond details
- **Parameters**:
  - `diamondid` (string): Diamond identifier
  - `shop` (string): Shop identifier
  - `diamondtype` (string): Diamond type ('labcreated' or empty)

## Query Parameters Reference

### Diamond Filter Parameters
- `pageSize` (number): Number of items per page
- `pageNumber` (number): Page number for pagination
- `searchDiamond` (string): Diamond ID to search for
- `orderBy` (string): Sort field
- `orderDirection` (string): Sort direction ('asc' or 'desc')
- `priceMin` (number): Minimum price filter
- `priceMax` (number): Maximum price filter
- `depth` (array): Depth range [min, max]
- `table` (array): Table range [min, max]
- `shape` (string): Diamond shape filter
- `symmetry` (string): Symmetry grade filter
- `polish` (string): Polish grade filter
- `certificates` (string): Certificate type filter
- `fluorescence` (string): Fluorescence grade filter
- `carat` (array): Carat range [min, max]
- `cut` (string): Cut grade filter
- `colour` (string): Color grade filter
- `clarity` (string): Clarity grade filter
- `isLabGrown` (boolean): Lab-grown filter
- `FancyColor` (string): Fancy color filter
- `intensity` (string): Color intensity filter
- `diamondfilter` (string): Additional diamond filter

### Settings Filter Parameters
- `pageSize` (number): Number of items per page
- `pageNumber` (number): Page number for pagination
- `searchSetting` (string): Setting ID to search for
- `orderBy` (string): Sort field
- `priceMin` (number): Minimum price filter
- `priceMax` (number): Maximum price filter
- `shape` (string): Ring shape filter
- `metalType` (string): Metal type filter
- `style` (string): Collection/style filter
- `isLabSettingsAvailable` (boolean): Lab settings availability filter
- `CenterStoneMinCarat` (number): Minimum center stone carat
- `CenterStoneMaxCarat` (number): Maximum center stone carat

## Error Handling

All API calls use the `fetchWrapper` utility which provides:
- Automatic error handling
- Response parsing
- Authentication header management
- Consistent error message formatting

## Authentication

The application uses:
- Form-based authentication for dealer access
- reCAPTCHA integration for form submissions
- Session-based authentication for protected areas

## Notes

1. **Dynamic Base URLs**: The application dynamically determines base URLs based on configuration settings retrieved from the `/reactconfig` endpoint.

2. **Environment Variables**: All base URLs and configuration values are stored in environment variables prefixed with `VITE_`.

3. **Form Data**: Most POST requests use `FormData` format rather than JSON.

4. **CORS**: The application handles cross-origin requests through the fetch wrapper utility.

5. **Error Responses**: API errors are handled consistently across all services with user-friendly error messages.

6. **Pagination**: Most list endpoints support pagination through `pageSize` and `pageNumber` parameters.

7. **Filtering**: Extensive filtering options are available for both diamonds and settings through query parameters.

This documentation covers all API endpoints found in the RingBuilder React application. For any updates or modifications, please ensure this documentation is kept current.

## Quick Reference - API Endpoints by Service

### JewelCloud APIs (http://api.jewelcloud.com)

1. `http://api.jewelcloud.com/api/RingBuilder/GetDiamondsJCOptions?DealerId={dealerId}`
2. `http://api.jewelcloud.com/api/RingBuilder/GetDiamondFilter?DealerId={dealerId}&IsLabGrown={isLabGrown}`
3. `http://api.jewelcloud.com/api/RingBuilder/GetInitialFilter?DealerId={dealerId}&IsLabGrown={isLabGrown}`
4. `http://api.jewelcloud.com/api/RingBuilder/GetColorDiamondFilter?DealerId={dealerId}`
5. `http://api.jewelcloud.com/api/RingBuilder/GetDiamond?DealerId={dealerId}{queryParam}`
6. `http://api.jewelcloud.com/api/RingBuilder/GetColorDiamond?DealerId={dealerId}{queryParam}&IsLabGrown=false`
7. `http://api.jewelcloud.com/api/RingBuilder/GetNavigation?DealerId={dealerId}`
8. `http://api.jewelcloud.com/api/RingBuilder/GetFilters?DealerId={dealerId}{queryParam}`
9. `http://api.jewelcloud.com/api/RingBuilder/GetMountingList?DealerId={dealerId}{queryParam}`
10. `http://api.jewelcloud.com/api/RingBuilder/GetRBNavigation?DealerId={dealerId}`
11. `http://api.jewelcloud.com/api/jewelry/GetVideoUrl?InventoryID={diamondId}&Type=Diamond`
12. `http://api.jewelcloud.com/api/jewelry/GetVideoUrl?InventoryID={settingId}&Type=Jewelry`

### GemFind.org APIs (https://gemfind.org)

1. `https://gemfind.org/ringbuilder/reactconfig`
2. `https://gemfind.org/ringbuilder/reactconfig/getcssStyle?shop={shop}`
3. `https://gemfind.org/ringbuilder/reactconfig/GetDiamondDetail?DealerId={dealerId}&DID={diamondId}&shop={shop}`
4. `https://gemfind.org/ringbuilder/reactconfig/GetMountingDetail?DealerId={dealerId}&SID={settingId}&shop={shop}`
5. `https://gemfind.org/ringbuilder/{sendRequest}/{apiCall}`
6. `https://gemfind.org/ringbuilder/{page}/authenticate`
7. `https://gemfind.org/ringbuilder/diamondtools/printdiamond`
8. `https://gemfind.org/public/react/newbuild` (Image assets base URL)

### Shop-Specific APIs (Dynamic URLs)

1. `{shop_domain}/apps/ringbuilder/reactconfig`
2. `{shop_domain}/apps/ringbuilder/diamondtools/cartadd/{diamondId}/{settingId}`
3. `{shop_domain}/apps/ringbuilder/diamondtools/completepurchase/{diamondId}/{settingId}`
4. `{shop_domain}/apps/ringbuilder/diamondtools/product/{diamondId}`
5. `{shop_domain}/apps/ringbuilder/settings/view/path/{settingId}`
