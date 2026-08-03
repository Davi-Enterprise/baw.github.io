#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Build a premium, cinematic, production-ready website for Black Amethyst Wrestling (BAW) — an independent pro wrestling promotion. Dark amethyst aesthetic, multi-page experience (Home, Events, Event Detail, Tickets, Roster, Roster Detail, Media, News, About, Contact + legal/merch pages), with events/roster/news data, newsletter signup, and contact form backed by MongoDB."

backend:
  - task: "Events API (list + detail) with auto-seed"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "GET /api/events returns list sorted by date; GET /api/events/:id returns detail. Auto-seeds 4 events on first call. Verified 200 in server logs."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: GET /api/events returns 4 events sorted ascending by date with all required fields (id, title, tagline, date, time, doorsOpen, venue, location, address, poster, banner, status, description, matches, parking, vip, faq). GET /api/events/amethyst-rising returns single event with matches (4) and faq (3) arrays. GET /api/events/nonexistent-id correctly returns 404 with error. No MongoDB _id present. UUID ids confirmed."
  - task: "Wrestlers/Roster API (list + detail)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "GET /api/wrestlers list; GET /api/wrestlers/:id detail. Auto-seeds 8 wrestlers with categories (men/women/tag/champions)."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: GET /api/wrestlers returns 8 wrestlers with all required fields (id, name, nickname, category, champion, championship, image, height, weight, hometown, debut, finisher, signatures, bio). Categories validated (men/women/tag). Champion field is boolean. Signatures is array. GET /api/wrestlers/obsidian-king returns single wrestler. GET /api/wrestlers/bad-id correctly returns 404 with error. No MongoDB _id present. UUID ids confirmed."
  - task: "News API"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "GET /api/news returns 6 seeded articles sorted newest first, with categories."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: GET /api/news returns 6 articles sorted descending by date (newest first) with all required fields (id, category, title, excerpt, date, image, author). No MongoDB _id present. UUID ids confirmed."
  - task: "Newsletter signup (POST)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "POST /api/newsletter with {email}. Validates email presence, stores with UUID."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: POST /api/newsletter with valid email returns 200 with {message, id}. UUID id confirmed. POST with empty body {} correctly returns 400 with error 'email is required'. Validation working correctly."
  - task: "Contact form (POST)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "POST /api/contact with {name,email,phone,subject,message}. Validates name/email/message, stores with UUID."
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: POST /api/contact with valid data (name, email, phone, subject, message) returns 200 with {message, id}. UUID id confirmed. POST with missing required fields correctly returns 400 with error 'name, email and message are required'. Validation working correctly."
  - task: "PayPal create-order endpoint"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: POST /api/paypal/create-order with valid tier (General Admission x2) returns 200 with {orderID}. PayPal sandbox order created successfully. MongoDB order document verified with UUID id, paypalOrderId, tier, qty, amount=40, status='pending'. No MongoDB _id exposed in API response. All three tiers tested (General Admission $20, First Row $30, Kids $10) with correct server-side pricing. Invalid tier 'VIP Nonsense' correctly returns 400 with error. Qty clamping working correctly: qty=0 clamped to 1, qty=99 clamped to 20, amounts reflect clamped qty."
  - task: "PayPal capture-order endpoint"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "testing"
        -comment: "✅ TESTED: POST /api/paypal/capture-order with missing orderID correctly returns 400 with error 'orderID required'. POST with fake/unapproved orderID 'FAKEORDER123' correctly returns 502 with error (no server crash). This is expected behavior as full successful capture requires buyer approval in PayPal UI which cannot be automated in testing."
  - task: "Image path self-heal migration (migrateImagePaths)"    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "ROOT CAUSE of production images: production DB had stale image paths (e.g. wrestlers.image='/tj-slater.png', events.poster='/inaugural-poster.png') WITHOUT the /api/asset/ prefix. ensureSeed used $setOnInsert so existing docs were never updated. Added migrateImagePaths(db) called inside ensureSeed which rewrites any local path (starts with '/' and not '/api/') to '/api/asset/<file>' for wrestlers.image, events.poster, events.banner, news.image. External http(s) URLs are left untouched. Verified manually: injected stale paths into preview DB, called /api/events, confirmed all fixed to /api/asset/... and external Unsplash URLs unchanged. This self-heals production on first API call after redeploy."

  - task: "Asset delivery route (GET /api/asset/:filename) - deployment-proof images"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "REWORK to fix production images that were broken because readFile(process.cwd()/public) fails in production standalone builds. Images (11 files) are now compressed and embedded as a bundled base64 module at /app/app/lib/asset-data.json (imported by route, so it deploys with code). Asset route serves priority: (1) bundled module, (2) MongoDB 'assets' collection, (3) filesystem fallback. ensureSeed() now also upserts all assets into the MongoDB 'assets' collection. Verified locally: all 11 asset filenames return 200 with correct Content-Type and compressed sizes (logo-t.png png 236KB, wrestlers/posters jpeg ~135-166KB). DB 'assets' collection seeded with 11 docs. Need testing agent to verify: all asset filenames (logo-t.png, tj-slater.png, arik-walker.png, dangelo-leflame.png, alex-rey.png, big-haus.jpeg, draco.png, james-derek.webp, rakzo-moreno.webp, inaugural-poster.png, schedule-poster.jpeg) return 200 with an image Content-Type and non-empty body; invalid/traversal filename returns 404; and regression on events/wrestlers/news still passes."
        -working: true
        -agent: "testing"
        -comment: "✅ ASSET DELIVERY ROUTE TESTS PASSED (28/28 - 100%). All 11 required asset files return HTTP 200 with correct image/* Content-Type and body size >1KB: logo-t.png (image/png, 241KB), tj-slater.png (image/jpeg, 166KB), arik-walker.png (image/jpeg, 164KB), dangelo-leflame.png (image/jpeg, 166KB), alex-rey.png (image/jpeg, 168KB), draco.png (image/jpeg, 170KB), inaugural-poster.png (image/jpeg, 139KB), big-haus.jpeg (image/jpeg, 162KB), schedule-poster.jpeg (image/jpeg, 152KB), james-derek.webp (image/jpeg, 156KB), rakzo-moreno.webp (image/jpeg, 157KB). Non-existent asset (does-not-exist.png) correctly returns 404. Path traversal safety verified: GET /api/asset/../package.json returns 404 (safe). MongoDB assets collection seeding verified: 11 documents with required fields (filename, contentType, data). REGRESSION TESTS PASSED: Events API returns 6 events sorted ascending with inaugural-show first (status: on-sale). Wrestlers API returns 8 wrestlers (all category 'men', champion false). News API returns exactly 1 article (inaugural-announcement). Asset delivery route is production-ready and deployment-proof."

  - task: "Fan portal, media, locked media, promo codes, event commemoratives (Phase B)"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "NEW big batch. (1) MEDIA/YOUTUBE: POST/GET/DELETE /api/admin/media (+public GET /api/media); youtube id parsed from any URL form. (2) FAN AUTH (bcryptjs): POST /api/auth/register (min 6 char pw, dup->409, invalid email->400), /api/auth/login (wrong->401), GET /api/auth/me, POST /api/auth/logout; sessions in usersessions. (3) LIBRARY: GET /api/me/library (Bearer user token) returns items + unlocked media; GET /api/me/unlocked/:id/file gated photo download (403 without entitlement). (4) LOCKED MEDIA: admin POST/GET/DELETE /api/admin/locked-media (photo stores full in lockedassets + blurred preview in assets; video stores youtube videoId hidden); public GET /api/locked-media is sanitized (no videoId/full). Unlock purchase via PayPal purpose='unlock' -> on capture creates entitlement. (5) PROMO CODES: admin POST/GET/DELETE/toggle /api/admin/promos (percent/amount/bogo, maxUses 0=unlimited); public POST /api/promo/validate computes discount; create-order applies promo + enforces ticket limit (GET/POST /api/admin/settings ticketLimitPerOrder); promo uses incremented on capture. (6) EVENT COMMEMORATIVES: admin POST /api/admin/event-commemorative, GET /api/admin/event-commemoratives, DELETE; on ticket capture, grantEventCommemorative auto-adds the show's commemorative card to buyer email's library. Also tickets auto-issued with QR (qrcode lib) on capture. Admin password @Bubba2021. All verified via node manually; needs formal testing (do NOT run live PayPal capture - fulfillment paths can't be auto-tested without buyer approval)."
        -working: true
        -agent: "testing"
        -comment: "✅ COMPREHENSIVE PHASE B BACKEND TESTS PASSED (42/42 - 100%). All Phase B features tested and verified. (1) MEDIA: POST /admin/media with YouTube URL 'https://youtu.be/dQw4w9WgXcQ' returns 200 with videoId 'dQw4w9WgXcQ' and thumbnail. Invalid URL returns 400. No token returns 401. GET /media (public) includes created video. DELETE /admin/media/:id returns 200. (2) FAN AUTH (bcrypt): POST /auth/register with unique email and password 'secret123' returns 200 with token and user. Duplicate email returns 409. Invalid email returns 400. Short password (<6) returns 400. POST /auth/login with wrong password returns 401, correct password returns 200 with token. GET /auth/me with Bearer token returns authenticated:true, without token returns authenticated:false. (3) LIBRARY: GET /me/library with user token returns {items:[], unlocked:[]} initially. GET /me/unlocked/<id>/file without entitlement returns 403, without token returns 401. (4) LOCKED MEDIA: POST /admin/locked-media with kind:'photo', title, price:5, fullBase64 returns 200 with id and previewImage. kind:'video', price:10, youtubeUrl returns 200 with videoId. price=0 returns 400. GET /locked-media (public) returns sanitized items WITHOUT videoId or full data. GET /admin/locked-media returns full data WITH videoId for videos. DELETE /admin/locked-media/:id returns 200. (5) PROMO CODES: POST /admin/promos with {code:'SAVE20', type:'percent', value:20, maxUses:2} returns 200. {code:'TENOFF', type:'amount', value:10} returns 200. {code:'BOGO', type:'bogo'} returns 200. Duplicate code returns 409. POST /promo/validate with items [GA qty:2, FR qty:1] (subtotal 70): SAVE20 returns discount:14 total:56. TENOFF returns discount:10 total:60. BOGO returns discount:20 total:50. Invalid code returns valid:false. POST /admin/promos/:id/toggle then validate returns valid:false (inactive). DELETE /admin/promos/:id returns 200. (6) SETTINGS + ticket limit: POST /admin/settings {ticketLimitPerOrder:2} returns 200. GET returns 2. POST /paypal/create-order with qty:3 returns 400 with 'at most 2 tickets per order' error (limit enforced). Set limit to 0, create-order with qty:3 returns orderID (live PayPal order created, no capture). create-order with valid promoCode 'SAVE20' returns orderID (discount applied). (7) EVENT COMMEMORATIVES: POST /admin/event-commemorative {eventId:'inaugural-show', title, imageBase64} returns 200 with eventTitle:'INAUGURAL SHOW'. GET /admin/event-commemoratives lists it. Missing eventId returns 400. DELETE /admin/event-commemoratives/inaugural-show returns 200. (8) REGRESSION: GET /events returns 6, GET /wrestlers returns 8, GET /news returns 1. CLEANUP: All test data successfully deleted. Final state verified: 0 media, 0 locked-media, 0 promos, 0 stories, 0 instagram posts, ticketLimit=0, 1 news article. Phase B backend is production-ready."

  - task: "Admin panel API: auth + Instagram posts + Stories + promote"
    implemented: true
    working: true
    file: "/app/app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "NEW FEATURE. Password-protected admin content manager. Endpoints: POST /api/admin/login {password} -> {token} (ADMIN_PASSWORD env = 'BAW-Amethyst-2026'); wrong password -> 401. GET /api/admin/me (Bearer token) -> {authenticated}. POST /api/admin/logout. POST /api/admin/instagram (auth) {link,caption,imageBase64,contentType} stores image into 'assets' collection as ig-<uuid>.<ext>, creates igpost with image=/api/asset/<filename>; missing image -> 400; no/invalid token -> 401. GET /api/instagram (public). POST /api/admin/instagram/:id/promote {asNews,asStory} -> creates Story (stories coll) and/or News article (news coll, category 'Instagram'). GET /api/stories (public). DELETE /api/admin/instagram/:id (also deletes ig- asset). DELETE /api/admin/stories/:id. DELETE /api/admin/news/:id. Verified manually via node end-to-end. Needs formal testing. Credentials in /app/memory/test_credentials.md."
        -working: true
        -agent: "testing"
        -comment: "✅ COMPREHENSIVE ADMIN CONTENT MANAGER API TESTS PASSED (22/22 - 100%). AUTH: Login with correct password returns token, wrong password returns 401, GET /admin/me with valid token returns authenticated:true, without/invalid token returns authenticated:false. INSTAGRAM POSTS: POST /admin/instagram without token returns 401, with token and image creates post with ig-<uuid> asset path (/api/asset/ig-...), GET on image path returns 200 with image/* content-type, POST without image returns 400, GET /instagram (public) includes created post. PROMOTE: POST /admin/instagram/:id/promote creates both storyId and newsId, GET /stories includes promoted story with all required fields (id, title, image, caption), GET /news includes promoted article with category 'Instagram'. DELETE: DELETE /admin/instagram/:id without token returns 401, with token removes post from list, DELETE /admin/stories/:id removes story, DELETE /admin/news/:id removes news article. CLEANUP: All test data successfully deleted. REGRESSION: GET /events returns 6 events, GET /wrestlers returns 8 wrestlers, GET /news returns 1 'Announcements' article (inaugural), GET /instagram returns 0 posts, GET /stories returns 0 stories. Admin content manager is production-ready."

frontend:
  - task: "Promo code apply bar in cart/checkout (P0 user-reported bug)"
    implemented: true
    working: true
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "USER-REPORTED BUG: promo codes created in admin were not applyable at checkout because the cart drawer had no promo input/apply UI. FIX in CartDrawer (page.js ~line 1418): added promoInput/promo/promoErr/applying state and applyPromo() which POSTs to /api/promo/validate with {code, items:[{tier,qty}]}. UI added in the checkout footer: (1) when no promo applied -> Promo code Input (Tag icon, uppercases, Enter to apply) + Apply button (spinner while applying, disabled when empty) + inline error text; (2) when promo applied -> an 'applied promo code bar' showing CODE + 'applied', label + '-$discount', and a Remove button; (3) when applied, a Subtotal + Discount breakdown line appears and TOTAL shows grandTotal = promo.total (server-computed). applyPromo re-runs silently on cart.total/cart.count change (useEffect) so displayed promo revalidates when quantities change. removePromo clears state. create-order body now includes promoCode: promo?.code so SERVER recomputes the final discounted amount (server remains source of truth - route.js create-order applies computePromoDiscount and sets amount). NEEDS FRONTEND TESTING. To test, a promo must exist: log into Admin (footer 'Admin' button, password in /app/memory/test_credentials.md) and create promos, OR create via POST /api/admin/promos. Test scenarios: valid percent code applies + shows discount bar + TOTAL drops; fixed amount code; BOGO code (just shows discounted total); invalid code shows error and does NOT apply; Remove clears promo and restores full total; changing ticket qty revalidates the applied promo; create-order receives the promoCode. Do NOT run a real/live PayPal capture."
        -working: true
        -agent: "testing"
        -comment: "✅ COMPREHENSIVE PROMO CODE TESTING COMPLETE (7/7 scenarios passed - 100%). Created test promo codes via API (TEST20 20% off, TEST5 $5 off). Navigated to Tickets page, added General Admission ($20) to cart, cart drawer opened. SCENARIO 1: ✅ Promo input field and Apply button visible in cart drawer. SCENARIO 2: ✅ Applied TEST20 (20% off) - promo bar appeared showing 'TEST20 applied', discount label '20% off', Subtotal and Discount breakdown lines visible, Remove button present, TOTAL correctly updated to $16.00 (20% off $20.00). SCENARIO 3: ✅ Clicked Remove button - promo bar disappeared, promo input field reappeared, TOTAL returned to $20.00. SCENARIO 4: ✅ Applied invalid promo code 'NOPE123' - error message 'Invalid or inactive code' displayed, no promo bar appeared, TOTAL remained $20.00 (no discount applied). SCENARIO 5: ✅ Applied TEST5 ($5 off) - promo bar showed 'TEST5', discount label '$5.00 off', TOTAL correctly updated to $15.00 ($20 - $5). SCENARIO 6: ✅ Changed quantity from 1 to 3 - promo automatically revalidated (useEffect triggered), TOTAL correctly updated to $55.00 (3×$20 - $5 = $55), Subtotal showed $60.00. SCENARIO 7: ✅ Promo code integration verified - code review confirms promoCode is sent in create-order request body (page.js line 1551: promoCode: promo?.code || undefined). All test promo codes deleted successfully. Promo code apply feature is working correctly and production-ready. User-reported bug is FIXED."
  - task: "Admin UI: login, add Instagram post, add Story directly, promote, stories bar + viewer"
    implemented: true
    working: true
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "NEW frontend feature. Footer 'Admin' link -> client route 'admin'. Login form (password only; password '@Bubba2021'). Dashboard: (1) ADD INSTAGRAM POST (link optional, caption, image upload resized client-side to base64), (2) ADD STORY DIRECTLY (caption, optional link, image upload, checkbox 'Also publish to Newsroom'), (3) POSTS list with 'Story' promote + delete, (4) STORIES list with delete. Homepage: StoriesBar below Hero (only if stories exist), StoryViewer modal, and 'ON INSTAGRAM' grid uses real /api/instagram posts. NOTE: inputs are React-controlled; use realistic typing so onChange fires. Image upload via hidden <input type=file>. Needs UI testing."
        -working: true
        -agent: "testing"
        -comment: "✅ COMPREHENSIVE ADMIN UI TESTS PASSED (9/9 - 100%). LOGIN: Successfully accessed Admin panel via footer button (not link - it's a <button> element), entered password '@Bubba2021', and logged into dashboard. ADD INSTAGRAM POST: Successfully added post with caption 'UITEST Instagram post - automated test' and uploaded image (big-haus.jpeg), post appeared in POSTS (1) list with caption visible. ADD STORY DIRECTLY: Successfully added story with caption 'UITEST direct story - automated test' and uploaded image (draco.png), 'Also publish to Newsroom' checkbox was checked by default, story appeared in STORIES (1) list. PROMOTE: Successfully clicked 'Story' button on Instagram post, stories count incremented from 1 to 2, promotion worked correctly. HOMEPAGE VERIFICATION: (a) Stories bar with 2 circular avatars appeared below hero section, (b) Clicking story avatar opened full-screen Story Viewer modal (minor: 'View on Instagram' link not found but modal opened correctly), closed via Escape key, (c) 'ON INSTAGRAM' grid section displayed 3 Instagram post images with /api/asset/ig- paths. CLEANUP: Successfully deleted all test data - 1 Instagram post and 2 stories deleted using delete buttons (selector: button[class*='hover:text-red']), final counts: POSTS (0), STORIES (0). All test data removed, site left clean. Admin content manager UI is production-ready."
  - task: "Cinematic multi-page SPA (Home, Events, Tickets, Roster, Media, News, About, Contact + details)"
    implemented: true
    working: true
    file: "/app/app/page.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "main"
        -comment: "Verified visually via screenshots: hero slideshow+smoke, countdown, featured wrestlers carousel, news, sponsor marquee, event detail with map/match card, tickets tiers, searchable roster, contact form. Navigation between pages works. Not yet run through automated frontend testing agent."
        -working: true
        -agent: "testing"
        -comment: "✅ COMPREHENSIVE UI TESTING PASSED (7/7 steps - 100%). Homepage: Hero headline 'WHERE RAW ENERGY MEETS DESTINY' visible, navbar logo visible, cart icon button visible. Tickets page: All 3 tiers (General Admission $20, First Row $30 marked Most Popular, Kids $10) render correctly with Add to Cart buttons. Cart functionality: Opens as slide-over panel with title 'YOUR CART', shows line items with tier name and price, email input field present, PayPal buttons render (iframe detected). EDITABLE QUANTITY INPUT (KEY FEATURE): Direct typing works perfectly - typed '5' and TOTAL updated to $100.00, typed '25' and correctly clamped to max 20 with TOTAL $400.00. Plus/minus buttons work correctly (tested increment/decrement). Multi-item cart: Both General Admission (qty 5) and First Row (qty 1) displayed simultaneously, TOTAL calculated correctly ($130.00 = 5×$20 + 1×$30), cart badge shows correct count (6). Remove functionality: Trash icon removes individual items correctly, empty state 'YOUR CART IS EMPTY' displays after removing all items. No critical console errors detected. All core shopping cart and PayPal checkout UI features working as specified."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Backend MVP complete for BAW. Please test all API endpoints: GET /api/events (list sorted by date), GET /api/events/{id} (detail + 404 for bad id), GET /api/wrestlers (list), GET /api/wrestlers/{id} (detail + 404), GET /api/news (list). POST /api/newsletter (valid email 200, missing email 400). POST /api/contact (valid 200, missing required fields 400). Auto-seed should populate data on first call. Base URL uses NEXT_PUBLIC_BASE_URL with /api prefix. Do NOT use ObjectID — all docs use UUID/string ids."
    -agent: "testing"
    -message: "✅ ALL BACKEND TESTS PASSED (11/11 - 100%). Comprehensive testing completed for all API endpoints. Events API: list (4 events, sorted ascending), detail, and 404 handling verified. Wrestlers API: list (8 wrestlers with men/women/tag categories), detail, and 404 handling verified. News API: list (6 articles, sorted descending/newest first) verified. Newsletter signup: valid email returns 200 with UUID, missing email returns 400. Contact form: valid submission returns 200 with UUID, missing required fields returns 400. All responses use UUID ids (no MongoDB _id). Data auto-seeding working correctly. All validation and error handling working as expected. Backend is production-ready."
    -agent: "testing"
    -message: "✅ PAYPAL PAYMENT INTEGRATION TESTS PASSED (6/6 - 100%). All PayPal endpoints tested successfully. POST /api/paypal/create-order: Creates PayPal sandbox orders, returns orderID, stores pending order in MongoDB with UUID id (no _id exposed). All three tiers tested with correct server-side pricing (General Admission $20, First Row $30, Kids $10). Invalid tier returns 400. Qty clamping working (0->1, 99->20). POST /api/paypal/capture-order: Missing orderID returns 400. Fake/unapproved orderID returns 502 (expected - requires buyer approval). REGRESSION TESTS PASSED (3/3): Events (6 events, inaugural-show first with on-sale status), Wrestlers (8 wrestlers with correct IDs, all category 'men', champion false), News (6 articles). PayPal integration is production-ready for sandbox mode."
    -agent: "testing"
    -message: "✅ SHOPPING CART & PAYPAL CHECKOUT UI TESTS PASSED (7/7 - 100%). Tested comprehensive shopping cart functionality on Black Amethyst Wrestling site. All test steps passed: (1) Homepage renders with hero headline, navbar logo, and cart icon. (2) Tickets page shows 3 tiers with correct prices and 'Most Popular' badge. (3) Cart slide-over opens with line item, quantity controls, email input, and PayPal buttons (iframe detected). (4) EDITABLE QUANTITY INPUT (key feature): Direct typing works perfectly - typed '5' updates TOTAL to $100.00, typed '25' clamps to max 20 with TOTAL $400.00. Plus/minus buttons increment/decrement correctly. (5) Multi-item cart: Both items display with separate quantity inputs, TOTAL calculates correctly ($130.00 for GA qty 5 + FR qty 1), cart badge shows correct count (6). (6) Remove functionality: Trash icon removes items individually, empty state displays correctly after removing all items. (7) No critical console errors. All shopping cart and PayPal checkout UI features working as specified. Frontend is production-ready."
    -agent: "main"
    -message: "Please test the reworked ASSET DELIVERY route which fixes broken production images. Focus: (1) GET /api/asset/<file> for each of these 11 filenames must return HTTP 200 with an image/* Content-Type and a non-empty body: logo-t.png, tj-slater.png, arik-walker.png, dangelo-leflame.png, alex-rey.png, big-haus.jpeg, draco.png, james-derek.webp, rakzo-moreno.webp, inaugural-poster.png, schedule-poster.jpeg. (2) GET /api/asset/does-not-exist.png returns 404. (3) A path-traversal attempt like /api/asset/../package.json must NOT return package.json (should be sanitized/404). (4) Verify the MongoDB 'assets' collection has 11 docs after any /api/events call (seeding). (5) Regression: GET /api/events (6 events, inaugural-show first), GET /api/wrestlers (8 wrestlers), GET /api/news (1 inaugural article). Do not run PayPal live captures. Base URL uses NEXT_PUBLIC_BASE_URL with /api prefix."
    -agent: "testing"
    -message: "✅ ASSET DELIVERY ROUTE COMPREHENSIVE TESTING COMPLETE (28/28 tests passed - 100%). All requirements verified: (1) All 11 asset files return HTTP 200 with correct image/* Content-Type and body >1KB. Sizes range from 139KB to 241KB. All wrestler images (tj-slater, arik-walker, dangelo-leflame, alex-rey, big-haus, draco, james-derek, rakzo-moreno) and posters (logo-t, inaugural-poster, schedule-poster) serving correctly. (2) Non-existent asset returns 404 as expected. (3) Path traversal safety confirmed: ../package.json returns 404 (sanitized). (4) MongoDB seeding verified: assets collection contains exactly 11 documents with required fields (filename, contentType, data). (5) All regression tests passed: Events API returns 6 events sorted ascending with inaugural-show first (status: on-sale), Wrestlers API returns 8 wrestlers (all category 'men', champion false), News API returns 1 article (inaugural-announcement). The reworked asset delivery route using bundled base64 module (asset-data.json) is production-ready and deployment-proof. No issues found."
    -agent: "testing"
    -message: "✅ ADMIN CONTENT MANAGER API COMPREHENSIVE TESTING COMPLETE (22/22 tests passed - 100%). Tested all admin endpoints with password 'BAW-Amethyst-2026'. AUTH (5/5): Login with correct password returns token, wrong password returns 401, GET /admin/me with valid token returns authenticated:true, without/invalid token returns authenticated:false. INSTAGRAM POSTS (5/5): POST /admin/instagram without token returns 401, with token and base64 image creates post with ig-<uuid> asset path, GET on image path returns 200 with image/png content-type (70 bytes), POST without image returns 400, GET /instagram (public) includes created post. PROMOTE (3/3): POST /admin/instagram/:id/promote with {asNews:true, asStory:true} creates both storyId and newsId, GET /stories includes promoted story with all required fields (id, title, image, caption), GET /news includes promoted article with category 'Instagram'. DELETE (4/4): DELETE /admin/instagram/:id without token returns 401, with token removes post from list and deletes ig- asset, DELETE /admin/stories/:id removes story, DELETE /admin/news/:id removes news article. CLEANUP: All test data successfully deleted (0 instagram posts, 0 stories). REGRESSION (5/5): GET /events returns 6 events, GET /wrestlers returns 8 wrestlers, GET /news returns exactly 1 'Announcements' article (inaugural), GET /instagram returns 0 posts, GET /stories returns 0 stories. Admin content manager is production-ready. No issues found."
    -agent: "testing"
    -message: "✅ ADMIN UI COMPREHENSIVE TESTING COMPLETE (9/9 tests passed - 100%). Tested complete admin content manager UI flow with password '@Bubba2021'. LOGIN: Successfully accessed Admin panel via footer button (note: it's a <button> element, not <a> link), entered password, and logged into dashboard showing 'ADD INSTAGRAM POST' and 'ADD STORY DIRECTLY' forms. ADD INSTAGRAM POST: Successfully added post with caption 'UITEST Instagram post - automated test' and uploaded image (big-haus.jpeg using set_input_files), post appeared in POSTS (1) list with caption visible. ADD STORY DIRECTLY: Successfully added story with caption 'UITEST direct story - automated test' and uploaded image (draco.png), 'Also publish to Newsroom' checkbox was checked by default, story appeared in STORIES (1) list. PROMOTE: Successfully clicked 'Story' button on Instagram post, stories count incremented from 1 to 2, promotion worked correctly creating a story from the post. HOMEPAGE VERIFICATION: (a) Stories bar with 2 circular avatars appeared below hero section on homepage, (b) Clicking story avatar opened full-screen Story Viewer modal (minor: 'View on Instagram' link not found in viewer but modal opened and closed correctly via Escape key), (c) 'ON INSTAGRAM' grid section displayed 3 Instagram post images with /api/asset/ig- paths. CLEANUP: Successfully deleted all test data - 1 Instagram post and 2 stories deleted using delete buttons (selector: button[class*='hover:text-red'] for Trash2 icon), final counts: POSTS (0), STORIES (0). All test data removed, site left clean with 0 posts and 0 stories. Admin content manager UI is production-ready and fully functional."
    -agent: "testing"
    -message: "✅ PHASE B COMPREHENSIVE BACKEND TESTING COMPLETE (42/42 tests passed - 100%). All Phase B features tested and verified working correctly. MEDIA (4/4): YouTube video creation with valid URL returns videoId and thumbnail, invalid URL returns 400, no token returns 401, public GET includes created videos. FAN AUTH (8/8): Register with valid data returns token, duplicate email returns 409, invalid email returns 400, short password returns 400, login with wrong password returns 401, correct password returns token, GET /auth/me with token returns authenticated:true, without token returns authenticated:false. LIBRARY (3/3): GET /me/library returns items and unlocked arrays, gated download without entitlement returns 403, without token returns 401. LOCKED MEDIA (5/5): POST photo with price returns id and previewImage, POST video returns videoId, price=0 returns 400, public GET sanitized (no videoId exposed), admin GET returns full data with videoId. PROMO CODES (9/9): Created SAVE20 (percent), TENOFF (amount), BOGO (bogo) successfully, duplicate code returns 409, validate SAVE20 returns discount:14 total:56, TENOFF returns discount:10 total:60, BOGO returns discount:20 total:50, invalid code returns valid:false, toggle then validate returns valid:false. SETTINGS + TICKET LIMIT (6/6): POST ticketLimitPerOrder=2 works, GET returns 2, create-order with qty:3 returns 400 with limit error, set limit to 0, create-order with qty:3 returns orderID (live PayPal order created, no capture), create-order with promoCode returns orderID. EVENT COMMEMORATIVES (3/3): POST with eventId:'inaugural-show' returns eventTitle:'INAUGURAL SHOW', GET lists it, missing eventId returns 400. REGRESSION (3/3): Events returns 6, wrestlers returns 8, news returns 1. CLEANUP: All test data deleted, final state verified (0 media, 0 locked-media, 0 promos, 0 stories, 0 instagram, ticketLimit=0, 1 news). Phase B backend is production-ready. No issues found."
    -agent: "main"
    -message: "PROMO CHECKOUT UI FIX ready for FRONTEND testing (user approved frontend testing). USER BUG: promo codes created in admin were not applyable at checkout - the cart drawer had no promo input. I added a full promo experience in CartDrawer (page.js ~1418). Please test the promo apply flow in the shopping cart: (1) SETUP a promo via Admin panel (footer 'Admin' button, password in /app/memory/test_credentials.md) - create a PERCENT promo e.g. code 'TEST20' value 20; also an AMOUNT promo e.g. 'TEST5' value 5; and a BOGO promo 'TESTBOGO' if the admin UI supports it (else create via POST /api/admin/promos). (2) Go to Tickets, Add to Cart (e.g. General Admission), open cart. (3) Verify a 'Promo code' input + 'Apply' button appear in the checkout footer. (4) Enter 'TEST20', click Apply -> an APPLIED PROMO BAR should appear showing the code + label + '-$discount' + a Remove button, a Subtotal & Discount line should show, and TOTAL should drop to the discounted amount (server-computed via /api/promo/validate). (5) Click Remove -> promo clears and TOTAL returns to full. (6) Apply an INVALID code e.g. 'NOPE123' -> inline error 'Invalid or inactive code' shows and NO bar appears. (7) Apply valid amount promo 'TEST5' -> $5 off. (8) With a promo applied, change the ticket quantity (+/- or type) -> the applied promo should silently REVALIDATE and the discount/total update accordingly. (9) Verify the create-order call sends promoCode (network: POST /api/paypal/create-order body includes promoCode) - DO NOT complete a real PayPal payment/capture. CLEAN UP any test promos created. Report pass/fail per scenario."
    -agent: "testing"
    -message: "✅ PROMO CODE APPLY FEATURE COMPREHENSIVE TESTING COMPLETE (7/7 scenarios passed - 100%). Created test promo codes via API (TEST20 20% off, TEST5 $5 off). Navigated to Tickets page, added General Admission ($20) to cart, cart drawer opened. SCENARIO 1: ✅ Promo input field and Apply button visible in cart drawer. SCENARIO 2: ✅ Applied TEST20 (20% off) - promo bar appeared showing 'TEST20 applied', discount label '20% off', Subtotal and Discount breakdown lines visible, Remove button present, TOTAL correctly updated to $16.00 (20% off $20.00). SCENARIO 3: ✅ Clicked Remove button - promo bar disappeared, promo input field reappeared, TOTAL returned to $20.00. SCENARIO 4: ✅ Applied invalid promo code 'NOPE123' - error message 'Invalid or inactive code' displayed, no promo bar appeared, TOTAL remained $20.00 (no discount applied). SCENARIO 5: ✅ Applied TEST5 ($5 off) - promo bar showed 'TEST5', discount label '$5.00 off', TOTAL correctly updated to $15.00 ($20 - $5). SCENARIO 6: ✅ Changed quantity from 1 to 3 - promo automatically revalidated (useEffect triggered), TOTAL correctly updated to $55.00 (3×$20 - $5 = $55), Subtotal showed $60.00. SCENARIO 7: ✅ Promo code integration verified - code review confirms promoCode is sent in create-order request body (page.js line 1551: promoCode: promo?.code || undefined). All test promo codes deleted successfully. Promo code apply feature is working correctly and production-ready. User-reported bug is FIXED."

