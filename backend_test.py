#!/usr/bin/env python3
"""
Backend API Test Suite for Black Amethyst Wrestling - Admin Content Manager
Tests admin auth, Instagram posts, Stories, News, and promote functionality
"""
import requests
import json
import sys
from typing import Dict, Any, Optional

# Base URL from environment
BASE_URL = "https://baw-elite.preview.emergentagent.com/api"
ADMIN_PASSWORD = "BAW-Amethyst-2026"

# Small 1x1 PNG base64 for testing (red pixel)
TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

# Test state
test_results = []
created_resources = {
    "instagram_posts": [],
    "stories": [],
    "news": []
}

def log_test(name: str, passed: bool, details: str = ""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    test_results.append({"name": name, "passed": passed, "details": details})
    print(f"{status}: {name}")
    if details:
        print(f"  Details: {details}")

def test_admin_login_correct_password():
    """Test admin login with correct password"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and data["token"]:
                log_test("Admin login with correct password", True, f"Token received: {data['token'][:20]}...")
                return data["token"]
            else:
                log_test("Admin login with correct password", False, "No token in response")
                return None
        else:
            log_test("Admin login with correct password", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Admin login with correct password", False, f"Exception: {str(e)}")
        return None

def test_admin_login_wrong_password():
    """Test admin login with wrong password"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": "wrong-password-123"},
            timeout=10
        )
        
        if response.status_code == 401:
            log_test("Admin login with wrong password returns 401", True, "Correctly rejected")
            return True
        else:
            log_test("Admin login with wrong password returns 401", False, f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Admin login with wrong password returns 401", False, f"Exception: {str(e)}")
        return False

def test_admin_me_with_token(token: str):
    """Test GET /api/admin/me with valid token"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("authenticated") == True:
                log_test("GET /admin/me with valid token", True, "authenticated: true")
                return True
            else:
                log_test("GET /admin/me with valid token", False, f"authenticated: {data.get('authenticated')}")
                return False
        else:
            log_test("GET /admin/me with valid token", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /admin/me with valid token", False, f"Exception: {str(e)}")
        return False

def test_admin_me_without_token():
    """Test GET /api/admin/me without token"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/me",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("authenticated") == False:
                log_test("GET /admin/me without token", True, "authenticated: false")
                return True
            else:
                log_test("GET /admin/me without token", False, f"authenticated: {data.get('authenticated')}")
                return False
        else:
            log_test("GET /admin/me without token", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /admin/me without token", False, f"Exception: {str(e)}")
        return False

def test_admin_me_with_invalid_token():
    """Test GET /api/admin/me with invalid token"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/me",
            headers={"Authorization": "Bearer invalid-token-12345"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("authenticated") == False:
                log_test("GET /admin/me with invalid token", True, "authenticated: false")
                return True
            else:
                log_test("GET /admin/me with invalid token", False, f"authenticated: {data.get('authenticated')}")
                return False
        else:
            log_test("GET /admin/me with invalid token", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /admin/me with invalid token", False, f"Exception: {str(e)}")
        return False

def test_create_instagram_post_without_token():
    """Test POST /api/admin/instagram without token"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/instagram",
            json={
                "link": "https://instagram.com/test",
                "caption": "Test post",
                "imageBase64": TEST_IMAGE_BASE64,
                "contentType": "image/png"
            },
            timeout=10
        )
        
        if response.status_code == 401:
            log_test("POST /admin/instagram without token returns 401", True, "Correctly rejected")
            return True
        else:
            log_test("POST /admin/instagram without token returns 401", False, f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("POST /admin/instagram without token returns 401", False, f"Exception: {str(e)}")
        return False

def test_create_instagram_post_with_token(token: str):
    """Test POST /api/admin/instagram with valid token and image"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/instagram",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "link": "https://instagram.com/blackamethystwrestling",
                "caption": "Test Instagram post from automated testing\nThis is a test caption for the admin content manager.",
                "imageBase64": TEST_IMAGE_BASE64,
                "contentType": "image/png"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "image" in data:
                if data["image"].startswith("/api/asset/ig-"):
                    created_resources["instagram_posts"].append(data["id"])
                    log_test("POST /admin/instagram with token and image", True, 
                            f"Created post {data['id']}, image: {data['image']}")
                    return data
                else:
                    log_test("POST /admin/instagram with token and image", False, 
                            f"Image path doesn't start with /api/asset/ig-: {data['image']}")
                    return None
            else:
                log_test("POST /admin/instagram with token and image", False, "Missing id or image in response")
                return None
        else:
            log_test("POST /admin/instagram with token and image", False, 
                    f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("POST /admin/instagram with token and image", False, f"Exception: {str(e)}")
        return None

def test_get_instagram_post_image(image_path: str):
    """Test GET on the returned image path"""
    try:
        # Remove /api prefix if present since BASE_URL already has it
        if image_path.startswith("/api/"):
            image_path = image_path[4:]  # Remove /api
        
        url = f"{BASE_URL}{image_path}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            content_type = response.headers.get("Content-Type", "")
            if content_type.startswith("image/"):
                log_test("GET Instagram post image", True, 
                        f"Image retrieved, Content-Type: {content_type}, Size: {len(response.content)} bytes")
                return True
            else:
                log_test("GET Instagram post image", False, f"Wrong Content-Type: {content_type}")
                return False
        else:
            log_test("GET Instagram post image", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET Instagram post image", False, f"Exception: {str(e)}")
        return False

def test_create_instagram_post_without_image(token: str):
    """Test POST /api/admin/instagram without image"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/instagram",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "link": "https://instagram.com/test",
                "caption": "Test post without image"
            },
            timeout=10
        )
        
        if response.status_code == 400:
            log_test("POST /admin/instagram without image returns 400", True, "Correctly rejected")
            return True
        else:
            log_test("POST /admin/instagram without image returns 400", False, 
                    f"Expected 400, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("POST /admin/instagram without image returns 400", False, f"Exception: {str(e)}")
        return False

def test_get_public_instagram_posts(expected_post_id: str):
    """Test GET /api/instagram (public endpoint)"""
    try:
        response = requests.get(f"{BASE_URL}/instagram", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Check if our created post is in the list
                found = any(post.get("id") == expected_post_id for post in data)
                if found:
                    log_test("GET /instagram includes created post", True, 
                            f"Found post {expected_post_id} in {len(data)} posts")
                    return True
                else:
                    log_test("GET /instagram includes created post", False, 
                            f"Post {expected_post_id} not found in {len(data)} posts")
                    return False
            else:
                log_test("GET /instagram includes created post", False, "Response is not an array")
                return False
        else:
            log_test("GET /instagram includes created post", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /instagram includes created post", False, f"Exception: {str(e)}")
        return False

def test_promote_instagram_post(token: str, post_id: str):
    """Test POST /api/admin/instagram/:id/promote"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/instagram/{post_id}/promote",
            headers={"Authorization": f"Bearer {token}"},
            json={"asNews": True, "asStory": True},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "storyId" in data and "newsId" in data:
                created_resources["stories"].append(data["storyId"])
                created_resources["news"].append(data["newsId"])
                log_test("POST /admin/instagram/:id/promote", True, 
                        f"Created story {data['storyId']} and news {data['newsId']}")
                return data
            else:
                log_test("POST /admin/instagram/:id/promote", False, 
                        f"Missing storyId or newsId in response: {data}")
                return None
        else:
            log_test("POST /admin/instagram/:id/promote", False, 
                    f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("POST /admin/instagram/:id/promote", False, f"Exception: {str(e)}")
        return None

def test_get_public_stories(expected_story_id: str):
    """Test GET /api/stories (public endpoint)"""
    try:
        response = requests.get(f"{BASE_URL}/stories", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Find our story
                story = next((s for s in data if s.get("id") == expected_story_id), None)
                if story:
                    # Verify required fields
                    required_fields = ["id", "title", "image", "caption"]
                    missing = [f for f in required_fields if f not in story]
                    if not missing:
                        log_test("GET /stories includes promoted story", True, 
                                f"Story {expected_story_id} has all required fields: {required_fields}")
                        return True
                    else:
                        log_test("GET /stories includes promoted story", False, 
                                f"Story missing fields: {missing}")
                        return False
                else:
                    log_test("GET /stories includes promoted story", False, 
                            f"Story {expected_story_id} not found in {len(data)} stories")
                    return False
            else:
                log_test("GET /stories includes promoted story", False, "Response is not an array")
                return False
        else:
            log_test("GET /stories includes promoted story", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /stories includes promoted story", False, f"Exception: {str(e)}")
        return False

def test_get_public_news(expected_news_id: str):
    """Test GET /api/news for promoted Instagram post"""
    try:
        response = requests.get(f"{BASE_URL}/news", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Find our news article
                article = next((n for n in data if n.get("id") == expected_news_id), None)
                if article:
                    # Verify category is 'Instagram'
                    if article.get("category") == "Instagram":
                        log_test("GET /news includes promoted article with category 'Instagram'", True, 
                                f"Article {expected_news_id} found with correct category")
                        return True
                    else:
                        log_test("GET /news includes promoted article with category 'Instagram'", False, 
                                f"Article category is '{article.get('category')}', expected 'Instagram'")
                        return False
                else:
                    log_test("GET /news includes promoted article with category 'Instagram'", False, 
                            f"Article {expected_news_id} not found in {len(data)} articles")
                    return False
            else:
                log_test("GET /news includes promoted article with category 'Instagram'", False, 
                        "Response is not an array")
                return False
        else:
            log_test("GET /news includes promoted article with category 'Instagram'", False, 
                    f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("GET /news includes promoted article with category 'Instagram'", False, f"Exception: {str(e)}")
        return False

def test_delete_instagram_post_without_token(post_id: str):
    """Test DELETE /api/admin/instagram/:id without token"""
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/instagram/{post_id}",
            timeout=10
        )
        
        if response.status_code == 401:
            log_test("DELETE /admin/instagram/:id without token returns 401", True, "Correctly rejected")
            return True
        else:
            log_test("DELETE /admin/instagram/:id without token returns 401", False, 
                    f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("DELETE /admin/instagram/:id without token returns 401", False, f"Exception: {str(e)}")
        return False

def test_delete_instagram_post(token: str, post_id: str):
    """Test DELETE /api/admin/instagram/:id with token"""
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/instagram/{post_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            # Verify it's no longer in the list
            list_response = requests.get(f"{BASE_URL}/instagram", timeout=10)
            if list_response.status_code == 200:
                posts = list_response.json()
                found = any(p.get("id") == post_id for p in posts)
                if not found:
                    log_test("DELETE /admin/instagram/:id removes post", True, 
                            f"Post {post_id} successfully deleted")
                    return True
                else:
                    log_test("DELETE /admin/instagram/:id removes post", False, 
                            f"Post {post_id} still exists after deletion")
                    return False
            else:
                log_test("DELETE /admin/instagram/:id removes post", False, 
                        "Could not verify deletion")
                return False
        else:
            log_test("DELETE /admin/instagram/:id removes post", False, 
                    f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("DELETE /admin/instagram/:id removes post", False, f"Exception: {str(e)}")
        return False

def test_delete_story(token: str, story_id: str):
    """Test DELETE /api/admin/stories/:id"""
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/stories/{story_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            log_test("DELETE /admin/stories/:id", True, f"Story {story_id} deleted")
            return True
        else:
            log_test("DELETE /admin/stories/:id", False, 
                    f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("DELETE /admin/stories/:id", False, f"Exception: {str(e)}")
        return False

def test_delete_news(token: str, news_id: str):
    """Test DELETE /api/admin/news/:id"""
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/news/{news_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            log_test("DELETE /admin/news/:id", True, f"News {news_id} deleted")
            return True
        else:
            log_test("DELETE /admin/news/:id", False, 
                    f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("DELETE /admin/news/:id", False, f"Exception: {str(e)}")
        return False

def test_regression_events():
    """Regression test: GET /api/events should return 6 events"""
    try:
        response = requests.get(f"{BASE_URL}/events", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 6:
                log_test("Regression: GET /events returns 6 events", True, 
                        f"Found {len(data)} events")
                return True
            else:
                log_test("Regression: GET /events returns 6 events", False, 
                        f"Expected 6 events, got {len(data) if isinstance(data, list) else 'non-array'}")
                return False
        else:
            log_test("Regression: GET /events returns 6 events", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("Regression: GET /events returns 6 events", False, f"Exception: {str(e)}")
        return False

def test_regression_wrestlers():
    """Regression test: GET /api/wrestlers should return 8 wrestlers"""
    try:
        response = requests.get(f"{BASE_URL}/wrestlers", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 8:
                log_test("Regression: GET /wrestlers returns 8 wrestlers", True, 
                        f"Found {len(data)} wrestlers")
                return True
            else:
                log_test("Regression: GET /wrestlers returns 8 wrestlers", False, 
                        f"Expected 8 wrestlers, got {len(data) if isinstance(data, list) else 'non-array'}")
                return False
        else:
            log_test("Regression: GET /wrestlers returns 8 wrestlers", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("Regression: GET /wrestlers returns 8 wrestlers", False, f"Exception: {str(e)}")
        return False

def test_regression_news():
    """Regression test: GET /api/news should return exactly 1 article after cleanup"""
    try:
        response = requests.get(f"{BASE_URL}/news", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Should have exactly 1 article (the inaugural announcement)
                if len(data) == 1:
                    article = data[0]
                    if article.get("category") == "Announcements":
                        log_test("Regression: GET /news returns 1 'Announcements' article", True, 
                                f"Found inaugural article: {article.get('title', 'N/A')}")
                        return True
                    else:
                        log_test("Regression: GET /news returns 1 'Announcements' article", False, 
                                f"Article category is '{article.get('category')}', expected 'Announcements'")
                        return False
                else:
                    log_test("Regression: GET /news returns 1 'Announcements' article", False, 
                            f"Expected 1 article, got {len(data)}")
                    return False
            else:
                log_test("Regression: GET /news returns 1 'Announcements' article", False, 
                        "Response is not an array")
                return False
        else:
            log_test("Regression: GET /news returns 1 'Announcements' article", False, 
                    f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("Regression: GET /news returns 1 'Announcements' article", False, f"Exception: {str(e)}")
        return False

def test_regression_instagram_empty():
    """Regression test: GET /api/instagram should return 0 posts after cleanup"""
    try:
        response = requests.get(f"{BASE_URL}/instagram", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 0:
                log_test("Regression: GET /instagram returns 0 posts", True, "Instagram posts cleaned up")
                return True
            else:
                log_test("Regression: GET /instagram returns 0 posts", False, 
                        f"Expected 0 posts, got {len(data) if isinstance(data, list) else 'non-array'}")
                return False
        else:
            log_test("Regression: GET /instagram returns 0 posts", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("Regression: GET /instagram returns 0 posts", False, f"Exception: {str(e)}")
        return False

def test_regression_stories_empty():
    """Regression test: GET /api/stories should return 0 stories after cleanup"""
    try:
        response = requests.get(f"{BASE_URL}/stories", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 0:
                log_test("Regression: GET /stories returns 0 stories", True, "Stories cleaned up")
                return True
            else:
                log_test("Regression: GET /stories returns 0 stories", False, 
                        f"Expected 0 stories, got {len(data) if isinstance(data, list) else 'non-array'}")
                return False
        else:
            log_test("Regression: GET /stories returns 0 stories", False, f"Status {response.status_code}")
            return False
    except Exception as e:
        log_test("Regression: GET /stories returns 0 stories", False, f"Exception: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=" * 80)
    print("BLACK AMETHYST WRESTLING - ADMIN CONTENT MANAGER API TESTS")
    print("=" * 80)
    print()
    
    # 1. Auth tests
    print("--- AUTH TESTS ---")
    token = test_admin_login_correct_password()
    if not token:
        print("\n❌ CRITICAL: Could not obtain admin token. Aborting tests.")
        sys.exit(1)
    
    test_admin_login_wrong_password()
    test_admin_me_with_token(token)
    test_admin_me_without_token()
    test_admin_me_with_invalid_token()
    print()
    
    # 2. Instagram posts tests
    print("--- INSTAGRAM POSTS TESTS ---")
    test_create_instagram_post_without_token()
    
    post_data = test_create_instagram_post_with_token(token)
    if not post_data:
        print("\n❌ CRITICAL: Could not create Instagram post. Aborting remaining tests.")
        sys.exit(1)
    
    post_id = post_data["id"]
    image_path = post_data["image"]
    
    test_get_instagram_post_image(image_path)
    test_create_instagram_post_without_image(token)
    test_get_public_instagram_posts(post_id)
    print()
    
    # 3. Promote tests
    print("--- PROMOTE TESTS ---")
    promote_data = test_promote_instagram_post(token, post_id)
    if not promote_data:
        print("\n❌ CRITICAL: Could not promote Instagram post. Aborting remaining tests.")
        sys.exit(1)
    
    story_id = promote_data["storyId"]
    news_id = promote_data["newsId"]
    
    test_get_public_stories(story_id)
    test_get_public_news(news_id)
    print()
    
    # 4. Delete tests (without token first)
    print("--- DELETE TESTS ---")
    test_delete_instagram_post_without_token(post_id)
    print()
    
    # 5. Cleanup - delete all created resources
    print("--- CLEANUP ---")
    test_delete_instagram_post(token, post_id)
    test_delete_story(token, story_id)
    test_delete_news(token, news_id)
    print()
    
    # 6. Regression tests
    print("--- REGRESSION TESTS ---")
    test_regression_events()
    test_regression_wrestlers()
    test_regression_news()
    test_regression_instagram_empty()
    test_regression_stories_empty()
    print()
    
    # Summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    total = len(test_results)
    passed = sum(1 for t in test_results if t["passed"])
    failed = total - passed
    
    print(f"Total tests: {total}")
    print(f"Passed: {passed} ✅")
    print(f"Failed: {failed} ❌")
    print(f"Success rate: {(passed/total*100):.1f}%")
    print()
    
    if failed > 0:
        print("Failed tests:")
        for t in test_results:
            if not t["passed"]:
                print(f"  ❌ {t['name']}")
                if t["details"]:
                    print(f"     {t['details']}")
        print()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()
