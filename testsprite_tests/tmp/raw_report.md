
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** mosc-temp
- **Date:** 2025-12-30
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test USER-001
- **Test Name:** User Login and Authentication
- **Test Code:** [USER-001_User_Login_and_Authentication.py](./USER-001_User_Login_and_Authentication.py)
- **Test Error:** Login form is missing on the sign-in page, preventing the test from proceeding with user login and authentication verification. The test is stopped due to this blocking issue.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED (at https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css:0:0)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/media/e4af272ccee01ff0-s.p.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/tenant-settings:0:0)
[WARNING] ⚠️ Network error fetching tenant settings (at webpack-internal:///(app-pages-browser)/./src/components/TenantSettingsProvider.tsx:113:32)
[ERROR] WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/dev/hot-reloader/app/use-websocket.js:37:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/chunks/_app-pages-browser_node_modules_next_dist_client_dev_noop-turbopack-hmr_js.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/5ef4490d-6559-4c10-ae02-9e9e7ac6104c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-002
- **Test Name:** Homepage Access After Login
- **Test Code:** [USER-002_Homepage_Access_After_Login.py](./USER-002_Homepage_Access_After_Login.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/f289a9e9-674d-41ec-be25-15463d0e96db
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-003
- **Test Name:** Profile Page Access
- **Test Code:** [USER-003_Profile_Page_Access.py](./USER-003_Profile_Page_Access.py)
- **Test Error:** The profile page at /profile is inaccessible or empty. No profile form, fields, or personal details are visible. Verification of profile page access and personal details viewing cannot be completed.
Browser Console Logs:
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp" has "fill" and parent element with invalid "position". Provided "static" should be one of absolute,fixed,relative. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://humble-monkey-3.clerk.accounts.dev/v1/environment?_clerk_js_version=4.73.14&_method=PATCH&__dev_session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMzdaVWtlODVVWjd3TEJUVUZrRUZqSUw4QU91In0.BB_bEOHl-C0Z_XX1o8CSbQRlOzX4oFpNQreFl1T_AmjLe4Wxez8GCq9MrwT8ezsE3JEE08EcpbtcKM518h_JiCFe0Mg4i0Kxnp7dl7D7q-JzaQGTuP1TcuMW9abwCo7FJeUwjTWNv_gyT2qzubFsvUz6J2bjt-xndCkLqyGUK1-o4EviDOkVcMLp2JUflrWNT_RgTZHGswZIOOOogLn2OBD97Htbj0wTQjdgRBeaAZVmJGEO9ZS6zDbrPVUkw5a5pOgQDTet7At9Tkz1VcqN37ivOAWsxaT8ACyMPNq6X-rx5ouKreN1cyqrZkNP2iI6otl3_NljtYwiR7Ndww7HnA:0:0)
[WARNING] e
    at o._fetch (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:80419)
    at async v._baseMutate (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:81107)
    at async Promise.all (index 0)
    at async se.<anonymous> (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:219655)
    at async se.load (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:198712)
    at async _IsomorphicClerk.loadClerkJS (webpack-internal:///(app-pages-browser)/./node_modules/@clerk/clerk-react/dist/esm/isomorphicClerk.js:725:9) (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:1:220031)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/profile:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://humble-monkey-3.clerk.accounts.dev/v1/environment?_clerk_js_version=4.73.14&_method=PATCH&__dev_session=dvb_37ZUke85UZ7wLBTUFkEFjIL8AOu:0:0)
[WARNING] e
    at o._fetch (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:80419)
    at async v._baseMutate (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:81107)
    at async Promise.all (index 0)
    at async se.<anonymous> (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:219655)
    at async se.load (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:198712)
    at async window.startClerk (http://localhost:3000/profile:40:21) (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:1:220031)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/d4bbed16-a734-47df-80d2-4bd01b2597b0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-004
- **Test Name:** Profile Edit - Personal Information
- **Test Code:** [USER-004_Profile_Edit___Personal_Information.py](./USER-004_Profile_Edit___Personal_Information.py)
- **Test Error:** The profile page at /profile is empty and does not display any personal information fields for editing. Therefore, the user cannot edit personal information as required. Stopping the test due to this issue.
Browser Console Logs:
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/tenant-settings:0:0)
[WARNING] ⚠️ Network error fetching tenant settings (at webpack-internal:///(app-pages-browser)/./src/components/TenantSettingsProvider.tsx:113:32)
[ERROR] WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/dev/hot-reloader/app/use-websocket.js:37:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/chunks/_app-pages-browser_node_modules_next_dist_client_dev_noop-turbopack-hmr_js.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/profile:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://humble-monkey-3.clerk.accounts.dev/v1/environment?_clerk_js_version=4.73.14&_method=PATCH&__dev_session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMzdaVXRoaUtSRzdMd3JNRkhwbXNGSFQ1bG1VIn0.Bs8U6tMdq35fL6QJ5Y5hjgEfWklZEK6WnrEvdkujb6p00FakTYYRW--uezVFybexO8bl6Ecz4BpvYL3qhgd4fNI86g1DC8g9EYS5tI7Pd1fCeXyntl-WlgkyN0P3-ObZmB2yQm5iuDv6ZfBOmx0m9uF8MShPsalVZQznPuRORte-2qc4zEVt-bvlsCs6QdD0fMCxjA7C5OyvFN7lEt4iIoltGfU6ByKkodgObh__BIcno4YDc-celVxah3heu_OmxbrD09zdb_4TtNTzpBlinMXb75Oy8SvzGcOgTYWv9786LfJGJq13gr-zmUZI2f8B2t4IlvsF1EkGXQRGuTPwtQ:0:0)
[WARNING] e
    at o._fetch (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:80419)
    at async v._baseMutate (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:81107)
    at async Promise.all (index 0)
    at async se.<anonymous> (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:219655)
    at async se.load (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:198712)
    at async window.startClerk (http://localhost:3000/profile:40:21) (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:1:220031)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/574209e1-17bc-47d5-8cea-08a7061b0aa9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-005
- **Test Name:** Profile Edit - Address Information
- **Test Code:** [USER-005_Profile_Edit___Address_Information.py](./USER-005_Profile_Edit___Address_Information.py)
- **Test Error:** Profile page is not accessible from the homepage or user email links. Unable to verify address editing functionality in profile. Stopping test.
Browser Console Logs:
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp" has "fill" and parent element with invalid "position". Provided "static" should be one of absolute,fixed,relative. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/dev/hot-reloader/app/use-websocket.js:37:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/dec703d6-c47e-41bc-81c8-00a907a875f2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-006
- **Test Name:** Profile Save - Save Changes
- **Test Code:** [USER-006_Profile_Save___Save_Changes.py](./USER-006_Profile_Save___Save_Changes.py)
- **Test Error:** Profile page is empty and does not load the profile form. Unable to verify profile changes. Stopping test.
Browser Console Logs:
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp" has "fill" and parent element with invalid "position". Provided "static" should be one of absolute,fixed,relative. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/media/tenantId/tenant_demo_001/executive-team-members/arun_sadasivan_1757093414753_3e098d44.jpeg:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/media/tenantId/tenant_demo_001/executive-team-members/latha_krishnan_1757093444035_7cfd3510.jpeg:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/media/tenantId/tenant_demo_001/executive-team-members/Manoj_Kizhakkoot_1757093467818_a471c9c7.png:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://humble-monkey-3.clerk.accounts.dev/v1/environment?_clerk_js_version=4.73.14&_method=PATCH&__dev_session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMzdaVWlRRWd4SXJ1TWdpTEJiN0plTWhXUnpsIn0.sAhF1mQ-zY8CVRar4Zf9YIdfACkfzWfOoRxZlxY--d84YWv4LN9yzpDTqmk8q44gwmvBbZ-m9hCnKzsOrj1tKPMOBuvjcCWt0nAg55YPXO6I7OSo3S6eNEfbsHWt6QECQmbtIi3hbvm0snRwt4sK4n9v2T8dDRHr8xq0pcEuBW43BnFQ8AtDpxMY2Qsg56g0rH2BZvNlL50YY-HECr9w0KlmcezW47ocmt3bdc3aNrMhmxW8WWtScIoBnPE6mcFjxUMMcEL5BF7jrs1mRirQmdC123Zsl16bCfV8phfeWv3VJMkm3MFYOGHxqKwsX0M3iSCRXOISbs-e0dZ9Yoy7Fw:0:0)
[WARNING] e
    at o._fetch (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:80419)
    at async v._baseMutate (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:81107)
    at async Promise.all (index 0)
    at async se.<anonymous> (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:219655)
    at async se.load (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:198712)
    at async _IsomorphicClerk.loadClerkJS (webpack-internal:///(app-pages-browser)/./node_modules/@clerk/clerk-react/dist/esm/isomorphicClerk.js:725:9) (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:1:220031)
[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) (at http://localhost:3000/profile:0:0)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://humble-monkey-3.clerk.accounts.dev/v1/environment?_clerk_js_version=4.73.14&_method=PATCH&__dev_session=dvb_37ZUiQEgxIruMgiLBb7JeMhWRzl:0:0)
[WARNING] e
    at o._fetch (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:80419)
    at async v._baseMutate (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:81107)
    at async Promise.all (index 0)
    at async se.<anonymous> (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:219655)
    at async se.load (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:198712)
    at async window.startClerk (http://localhost:3000/profile:40:21) (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:1:220031)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/726c2edb-3ff8-43a6-aa99-10f3e381504a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-007
- **Test Name:** Events Listing Page Access
- **Test Code:** [USER-007_Events_Listing_Page_Access.py](./USER-007_Events_Listing_Page_Access.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/800ef00b-762c-422a-b3d6-fb31aa771b58
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-008
- **Test Name:** Event Details Page Access
- **Test Code:** [USER-008_Event_Details_Page_Access.py](./USER-008_Event_Details_Page_Access.py)
- **Test Error:** The events listing page loaded successfully but no events are available to view details. Additionally, the user is not authenticated as indicated by the presence of Sign In and Sign Up links and absence of a user profile avatar/menu. Therefore, it is not possible to verify that an authenticated user can view event details. Task cannot be completed as specified.
Browser Console Logs:
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/media/e4af272ccee01ff0-s.p.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/tenant-settings:0:0)
[WARNING] ⚠️ Network error fetching tenant settings (at webpack-internal:///(app-pages-browser)/./src/components/TenantSettingsProvider.tsx:113:32)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/chunks/_app-pages-browser_node_modules_next_dist_client_dev_noop-turbopack-hmr_js.js:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/dev/hot-reloader/app/use-websocket.js:37:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/c38767e2-e0a5-4a30-831b-c4a1f8ec2a3b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-009
- **Test Name:** Gallery Page Access
- **Test Code:** [USER-009_Gallery_Page_Access.py](./USER-009_Gallery_Page_Access.py)
- **Test Error:** Gallery page loaded successfully with main components visible. However, user profile avatar/menu is not visible, indicating the user is not authenticated. Task to verify authenticated user access to gallery page is therefore incomplete due to lack of authentication. Stopping as per task instruction.
Browser Console Logs:
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/media/e4af272ccee01ff0-s.p.woff2:0:0)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/tenant-settings:0:0)
[WARNING] ⚠️ Network error fetching tenant settings (at webpack-internal:///(app-pages-browser)/./src/components/TenantSettingsProvider.tsx:113:32)
[ERROR] WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/dev/hot-reloader/app/use-websocket.js:37:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/chunks/_app-pages-browser_node_modules_next_dist_client_dev_noop-turbopack-hmr_js.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/549b42c9-934f-4018-9055-025c0f938334
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-010
- **Test Name:** Gallery Search and Filter
- **Test Code:** [USER-010_Gallery_Search_and_Filter.py](./USER-010_Gallery_Search_and_Filter.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/32e278b7-2346-4807-832f-790d89c64c59
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-011
- **Test Name:** About Page Access
- **Test Code:** [USER-011_About_Page_Access.py](./USER-011_About_Page_Access.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/0acc4834-c042-4a3f-932c-2d488a090958
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-012
- **Test Name:** Contact Page Access
- **Test Code:** [USER-012_Contact_Page_Access.py](./USER-012_Contact_Page_Access.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/fb472373-7b9e-41ae-bf8f-c1b62eb6f571
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-013
- **Test Name:** Polls Page Access
- **Test Code:** [USER-013_Polls_Page_Access.py](./USER-013_Polls_Page_Access.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/8a843c94-e324-4f54-8ae5-e63fc2388b7b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-014
- **Test Name:** Calendar Page Access
- **Test Code:** [USER-014_Calendar_Page_Access.py](./USER-014_Calendar_Page_Access.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/3f912040-899c-43dd-98d4-317cb6e6d2a7
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-015
- **Test Name:** Pricing Page Access
- **Test Code:** [USER-015_Pricing_Page_Access.py](./USER-015_Pricing_Page_Access.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/5a949d07-e4f2-4f4f-b8f3-d33fcf70c6eb
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-016
- **Test Name:** Navigation - Profile Link from Features Menu
- **Test Code:** [USER-016_Navigation___Profile_Link_from_Features_Menu.py](./USER-016_Navigation___Profile_Link_from_Features_Menu.py)
- **Test Error:** The 'Profile' link is not present in the 'Features' dropdown menu or anywhere on the homepage navigation. Therefore, navigation to the profile page from the Features dropdown cannot be verified. Task stopped.
Browser Console Logs:
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "/images/hero_section/default_hero_section_second_column_poster.webp" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://humble-monkey-3.clerk.accounts.dev/v1/environment?_clerk_js_version=4.73.14&_method=PATCH&__dev_session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMzdaVWtyQ0M4Mzd3SEdnTmhwUFhIQlVHRHN6In0.1Th22uI46ijaGx0vzLTnuzDtgQB3fjI_Q5T0VFA0RniZuDeJS9rvGL4SkgM3AxhzKGNODe055BCo-kurMmeLevxiHR4uA_9dbE8SECQCg7wz3o8zAUaeXSptgr_56vdIV_LikKskRMCkDgLqyKncMLy4CJP-YZiJgqh1ZcsrAMZatjrT_xhCZQd6AxQR-vFDfJtrbWGI39O5dywQv1fr5zeoJeuYU5XZPgxQAdfRe7Wal1ev5k3ETqZ63_wlYq9mEWCr8K3bc_-k8i0TplErpWhS-13cb5NhAdWcwQtUPZvqgdiztQAPh4M2_RD2hvuiaiOZ9LsXnw0dfoZuGfY94A:0:0)
[WARNING] e
    at o._fetch (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:80419)
    at async v._baseMutate (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:81107)
    at async Promise.all (index 0)
    at async se.<anonymous> (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:219655)
    at async se.load (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:198712)
    at async _IsomorphicClerk.loadClerkJS (webpack-internal:///(app-pages-browser)/./node_modules/@clerk/clerk-react/dist/esm/isomorphicClerk.js:725:9) (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:1:220031)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/6d2b66d6-5899-4743-8aa3-e7343c5ea4bd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-017
- **Test Name:** User Sign Out
- **Test Code:** [USER-017_User_Sign_Out.py](./USER-017_User_Sign_Out.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/d598b754-84d2-46a2-ab3d-19458831d3d5
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-018
- **Test Name:** Post-Logout Public Page Access
- **Test Code:** [USER-018_Post_Logout_Public_Page_Access.py](./USER-018_Post_Logout_Public_Page_Access.py)
- **Test Error:** 
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css:0:0)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "/images/hero_section/default_hero_section_second_column_poster.webp" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://humble-monkey-3.clerk.accounts.dev/v1/environment?_clerk_js_version=4.73.14&_method=PATCH&__dev_session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMzdaVWtwUm16UnBJMTFMUjkyMU5WMzVkU1lkIn0.i2LWpPALVOhRO2rkBprqwNyHTpG0fWdnK-ax36cdlyL0c4Yrd-gA4FnT3l-AuWlr5-kg5K60Xj7mwVlHZtz38DqrnaIYfAVpiqbS8qR_H9zQf1tt2nBgPh6WMjHK8PY6BGVp6dUPI9yVz0wLRKZg2_KNBjMMh7ssT24rhxmWR5MRL2XoXrj9hUN3mwEhjHKFC6K4nTzG5OJh5yQkTC9D2LdhL_yYLO7bdLxw2BuQknSCUlovBQPB8y9WSvMuKmJ1o_StNTjvnynyTvNg0Mwjq2zPmS91HcocwkX6B0gCzOnhxQibQ0Y_9-Q6XXXua6x4L_MQ8mYiIDKsMXe8GMbmRQ:0:0)
[WARNING] e
    at o._fetch (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:80419)
    at async v._baseMutate (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:81107)
    at async Promise.all (index 0)
    at async se.<anonymous> (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:219655)
    at async se.load (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:198712)
    at async _IsomorphicClerk.loadClerkJS (webpack-internal:///(app-pages-browser)/./node_modules/@clerk/clerk-react/dist/esm/isomorphicClerk.js:725:9) (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:1:220031)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/788d3d84-04fb-4e5c-8223-11a54d56427b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-019
- **Test Name:** Re-Login After Logout
- **Test Code:** [USER-019_Re_Login_After_Logout.py](./USER-019_Re_Login_After_Logout.py)
- **Test Error:** The sign-in page does not display the email and password input fields required for login. Despite attempts to locate and interact with these fields, they remain missing or hidden, preventing the completion of the login verification task. Reporting this issue and stopping further actions.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://fonts.googleapis.com/css?family=Epilogue:300,400,500,600,700|Sora:400,500,600,700&display=swap:0:0)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/media/e4af272ccee01ff0-s.p.woff2:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/tenant-settings:0:0)
[WARNING] ⚠️ Network error fetching tenant settings (at webpack-internal:///(app-pages-browser)/./src/components/TenantSettingsProvider.tsx:113:32)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/_next/static/chunks/_app-pages-browser_node_modules_next_dist_client_dev_noop-turbopack-hmr_js.js:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/_next/webpack-hmr' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/dev/hot-reloader/app/use-websocket.js:37:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/api/proxy/event-details?sort=startDate,asc:0:0)
[WARNING] Detected `scroll-behavior: smooth` on the `<html>` element. In a future version, Next.js will no longer automatically disable smooth scrolling during route transitions. To prepare for this change, add `data-scroll-behavior="smooth"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/14cff9f1-252b-4721-829a-c74fae5dc13e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test USER-020
- **Test Name:** Profile Page - Email Subscription Toggle
- **Test Code:** [USER-020_Profile_Page___Email_Subscription_Toggle.py](./USER-020_Profile_Page___Email_Subscription_Toggle.py)
- **Test Error:** 
Browser Console Logs:
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fee43fae6623544d193ab0c26deca1d95?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/loading_events.jpg" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "http://localhost:3000/images/hero_section/default_hero_section_second_column_poster.webp" has "fill" and parent element with invalid "position". Provided "static" should be one of absolute,fixed,relative. (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[WARNING] Image with src "/images/hero_section/default_hero_section_second_column_poster.webp" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.
Read more: https://nextjs.org/docs/api-reference/next/image#priority (at webpack-internal:///(app-pages-browser)/./node_modules/next/dist/shared/lib/utils/warn-once.js:15:20)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://humble-monkey-3.clerk.accounts.dev/v1/environment?_clerk_js_version=4.73.14&_method=PATCH&__dev_session=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJkdmJfMzdaVW0xaU9lV2c5UjlIUmFXbkNQblRQb1psIn0.qGhxPk4Eore3YiqetiMjnHcXH9wWe_MxZU_nWdqj14Qek1tqeQLeJWl8Ux6jI4s0P9eUj7xwrXbBPUvlDYJ4nud0_sqgHaTiXo-NRX73wF5W3vhExZZIbJzgL7CWDlYN8WTxT7Uvd9YE60RnRSJHTmwtheISb4nWSrC2z4jDCPQCGOTksuNCPn5e109-x4BRZmpLnIcgH53uxhgZHchhxDGl2fiQmvdUnUrCChcakSLlzjfQGoCKhcAaB-QNiYai_ht6SBu4dIPbinFy2fllUscdtMLw4p2NlWSBTRPPuoEdnBwjUvYtEmvdNf0xw0TL-tKYktjEVz3n9BRZUATcmQ:0:0)
[WARNING] e
    at o._fetch (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:80419)
    at async v._baseMutate (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:81107)
    at async Promise.all (index 0)
    at async se.<anonymous> (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:219655)
    at async se.load (https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:2:198712)
    at async _IsomorphicClerk.loadClerkJS (webpack-internal:///(app-pages-browser)/./node_modules/@clerk/clerk-react/dist/esm/isomorphicClerk.js:725:9) (at https://humble-monkey-3.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js:1:220031)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/f8ca09a3-e97f-4b18-a94b-b521d352c115/719d5347-288c-4294-a76e-0862aee962aa
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **45.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---