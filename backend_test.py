#!/usr/bin/env python3
"""
Comprehensive backend test for Black Amethyst Wrestling Phase B features.
Tests: Media, Fan Auth, Library, Locked Media, Promo Codes, Settings, Event Commemoratives.
"""

import requests
import json
import base64
import sys
from pathlib import Path

# Base URL from environment
BASE_URL = "https://baw-elite.preview.emergentagent.com/api"
ADMIN_PASSWORD = "@Bubba2021"

# Test state tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

# Cleanup tracking
cleanup_ids = {
    "media": [],
    "locked_media": [],
    "promos": [],
    "users": [],
    "stories": [],
    "instagram": [],
    "news": []
}

def log_test(name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"  Details: {details}")
    test_results["tests"].append({"name": name, "passed": passed, "details": details})
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1

def get_small_test_image():
    """Generate a small test image (1x1 PNG) as base64"""
    # 1x1 red PNG
    png_bytes = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    )
    return base64.b64encode(png_bytes).decode('utf-8')

def get_small_test_jpg():
    """Generate a small test JPG as base64"""
    # Small red JPEG
    jpg_bytes = base64.b64decode(
        "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
    )
    return base64.b64encode(jpg_bytes).decode('utf-8')

def admin_login():
    """Login as admin and return token"""
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD})
        if resp.status_code == 200:
            token = resp.json().get("token")
            log_test("Admin login", True, f"Token received")
            return token
        else:
            log_test("Admin login", False, f"Status {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        log_test("Admin login", False, str(e))
        return None

def test_media(admin_token):
    """Test 1: MEDIA endpoints"""
    print("\n=== TEST 1: MEDIA (YouTube videos) ===")
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test POST with valid YouTube URL
    try:
        resp = requests.post(f"{BASE_URL}/admin/media", 
                           headers=headers,
                           json={"youtubeUrl": "https://youtu.be/dQw4w9WgXcQ", "title": "Test Video"})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("videoId") == "dQw4w9WgXcQ" and "thumbnail" in data:
                log_test("POST /admin/media with valid YouTube URL", True, f"videoId: {data['videoId']}")
                cleanup_ids["media"].append(data["id"])
            else:
                log_test("POST /admin/media with valid YouTube URL", False, f"Missing videoId or thumbnail: {data}")
        else:
            log_test("POST /admin/media with valid YouTube URL", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /admin/media with valid YouTube URL", False, str(e))
    
    # Test POST with invalid URL
    try:
        resp = requests.post(f"{BASE_URL}/admin/media", 
                           headers=headers,
                           json={"youtubeUrl": "not-a-youtube-url"})
        if resp.status_code == 400:
            log_test("POST /admin/media with invalid URL returns 400", True)
        else:
            log_test("POST /admin/media with invalid URL returns 400", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /admin/media with invalid URL returns 400", False, str(e))
    
    # Test POST without token
    try:
        resp = requests.post(f"{BASE_URL}/admin/media", 
                           json={"youtubeUrl": "https://youtu.be/dQw4w9WgXcQ"})
        if resp.status_code == 401:
            log_test("POST /admin/media without token returns 401", True)
        else:
            log_test("POST /admin/media without token returns 401", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /admin/media without token returns 401", False, str(e))
    
    # Test GET public media
    try:
        resp = requests.get(f"{BASE_URL}/media")
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET /media (public) includes created video", True, f"Found {len(data)} videos")
            else:
                log_test("GET /media (public) includes created video", False, f"Expected array with items: {data}")
        else:
            log_test("GET /media (public) includes created video", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /media (public) includes created video", False, str(e))

def test_fan_auth():
    """Test 2: FAN AUTH (bcrypt)"""
    print("\n=== TEST 2: FAN AUTH (bcrypt) ===")
    
    test_email = f"testfan_{int(requests.get(f'{BASE_URL}/').elapsed.total_seconds() * 1000000)}@test.com"
    test_password = "secret123"
    test_name = "Test Fan"
    user_token = None
    
    # Test register with valid data
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", 
                           json={"email": test_email, "password": test_password, "name": test_name})
        if resp.status_code == 200:
            data = resp.json()
            if "token" in data and "user" in data:
                user_token = data["token"]
                log_test("POST /auth/register with valid data", True, f"Token received, user: {data['user']}")
                cleanup_ids["users"].append(test_email)
            else:
                log_test("POST /auth/register with valid data", False, f"Missing token or user: {data}")
        else:
            log_test("POST /auth/register with valid data", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /auth/register with valid data", False, str(e))
    
    # Test register with duplicate email
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", 
                           json={"email": test_email, "password": test_password, "name": test_name})
        if resp.status_code == 409:
            log_test("POST /auth/register with duplicate email returns 409", True)
        else:
            log_test("POST /auth/register with duplicate email returns 409", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /auth/register with duplicate email returns 409", False, str(e))
    
    # Test register with invalid email
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", 
                           json={"email": "not-an-email", "password": test_password})
        if resp.status_code == 400:
            log_test("POST /auth/register with invalid email returns 400", True)
        else:
            log_test("POST /auth/register with invalid email returns 400", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /auth/register with invalid email returns 400", False, str(e))
    
    # Test register with short password
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", 
                           json={"email": "new@test.com", "password": "12345"})
        if resp.status_code == 400:
            log_test("POST /auth/register with short password (<6) returns 400", True)
        else:
            log_test("POST /auth/register with short password (<6) returns 400", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /auth/register with short password (<6) returns 400", False, str(e))
    
    # Test login with wrong password
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", 
                           json={"email": test_email, "password": "wrongpassword"})
        if resp.status_code == 401:
            log_test("POST /auth/login with wrong password returns 401", True)
        else:
            log_test("POST /auth/login with wrong password returns 401", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /auth/login with wrong password returns 401", False, str(e))
    
    # Test login with correct password
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", 
                           json={"email": test_email, "password": test_password})
        if resp.status_code == 200:
            data = resp.json()
            if "token" in data:
                log_test("POST /auth/login with correct password returns 200 with token", True)
            else:
                log_test("POST /auth/login with correct password returns 200 with token", False, f"Missing token: {data}")
        else:
            log_test("POST /auth/login with correct password returns 200 with token", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /auth/login with correct password returns 200 with token", False, str(e))
    
    # Test GET /auth/me with Bearer token
    if user_token:
        try:
            resp = requests.get(f"{BASE_URL}/auth/me", 
                              headers={"Authorization": f"Bearer {user_token}"})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("authenticated") == True:
                    log_test("GET /auth/me with Bearer token returns authenticated:true", True)
                else:
                    log_test("GET /auth/me with Bearer token returns authenticated:true", False, f"authenticated={data.get('authenticated')}")
            else:
                log_test("GET /auth/me with Bearer token returns authenticated:true", False, f"Status {resp.status_code}")
        except Exception as e:
            log_test("GET /auth/me with Bearer token returns authenticated:true", False, str(e))
    
    # Test GET /auth/me without token
    try:
        resp = requests.get(f"{BASE_URL}/auth/me")
        if resp.status_code == 200:
            data = resp.json()
            if data.get("authenticated") == False:
                log_test("GET /auth/me without token returns authenticated:false", True)
            else:
                log_test("GET /auth/me without token returns authenticated:false", False, f"authenticated={data.get('authenticated')}")
        else:
            log_test("GET /auth/me without token returns authenticated:false", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /auth/me without token returns authenticated:false", False, str(e))
    
    return user_token

def test_library(user_token):
    """Test 3: LIBRARY + gated download"""
    print("\n=== TEST 3: LIBRARY + gated download ===")
    
    if not user_token:
        log_test("GET /me/library (skipped - no user token)", False, "User token not available")
        return
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test GET /me/library with user token
    try:
        resp = requests.get(f"{BASE_URL}/me/library", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if "items" in data and "unlocked" in data:
                if isinstance(data["items"], list) and isinstance(data["unlocked"], list):
                    log_test("GET /me/library with user token returns items and unlocked arrays", True, 
                           f"items: {len(data['items'])}, unlocked: {len(data['unlocked'])}")
                else:
                    log_test("GET /me/library with user token returns items and unlocked arrays", False, 
                           f"Expected arrays: {data}")
            else:
                log_test("GET /me/library with user token returns items and unlocked arrays", False, 
                       f"Missing items or unlocked: {data}")
        else:
            log_test("GET /me/library with user token returns items and unlocked arrays", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /me/library with user token returns items and unlocked arrays", False, str(e))
    
    # Test gated download without entitlement
    try:
        resp = requests.get(f"{BASE_URL}/me/unlocked/fake-media-id/file", headers=headers)
        if resp.status_code == 403:
            log_test("GET /me/unlocked/<id>/file without entitlement returns 403", True)
        else:
            log_test("GET /me/unlocked/<id>/file without entitlement returns 403", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /me/unlocked/<id>/file without entitlement returns 403", False, str(e))
    
    # Test gated download without token
    try:
        resp = requests.get(f"{BASE_URL}/me/unlocked/fake-media-id/file")
        if resp.status_code == 401:
            log_test("GET /me/unlocked/<id>/file without token returns 401", True)
        else:
            log_test("GET /me/unlocked/<id>/file without token returns 401", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /me/unlocked/<id>/file without token returns 401", False, str(e))

def test_locked_media(admin_token):
    """Test 4: LOCKED MEDIA"""
    print("\n=== TEST 4: LOCKED MEDIA ===")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test POST locked photo
    try:
        image_base64 = get_small_test_jpg()
        resp = requests.post(f"{BASE_URL}/admin/locked-media", 
                           headers=headers,
                           json={
                               "kind": "photo",
                               "title": "Test Locked Photo",
                               "price": 5,
                               "fullBase64": image_base64,
                               "fullContentType": "image/jpeg"
                           })
        if resp.status_code == 200:
            data = resp.json()
            if "id" in data and "previewImage" in data and data.get("kind") == "photo":
                log_test("POST /admin/locked-media with photo", True, 
                       f"id: {data['id']}, previewImage: {data.get('previewImage')}")
                cleanup_ids["locked_media"].append(data["id"])
            else:
                log_test("POST /admin/locked-media with photo", False, f"Missing fields: {data}")
        else:
            log_test("POST /admin/locked-media with photo", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /admin/locked-media with photo", False, str(e))
    
    # Test POST locked video
    try:
        resp = requests.post(f"{BASE_URL}/admin/locked-media", 
                           headers=headers,
                           json={
                               "kind": "video",
                               "title": "Test Locked Video",
                               "price": 10,
                               "youtubeUrl": "https://youtu.be/dQw4w9WgXcQ"
                           })
        if resp.status_code == 200:
            data = resp.json()
            if "id" in data and "videoId" in data and data.get("kind") == "video":
                log_test("POST /admin/locked-media with video", True, 
                       f"id: {data['id']}, videoId: {data.get('videoId')}")
                cleanup_ids["locked_media"].append(data["id"])
            else:
                log_test("POST /admin/locked-media with video", False, f"Missing fields: {data}")
        else:
            log_test("POST /admin/locked-media with video", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /admin/locked-media with video", False, str(e))
    
    # Test POST with missing price
    try:
        resp = requests.post(f"{BASE_URL}/admin/locked-media", 
                           headers=headers,
                           json={
                               "kind": "photo",
                               "title": "No Price",
                               "fullBase64": get_small_test_jpg(),
                               "fullContentType": "image/jpeg"
                           })
        if resp.status_code == 400:
            log_test("POST /admin/locked-media with price=0 returns 400", True)
        else:
            log_test("POST /admin/locked-media with price=0 returns 400", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /admin/locked-media with price=0 returns 400", False, str(e))
    
    # Test GET public locked-media (sanitized)
    try:
        resp = requests.get(f"{BASE_URL}/locked-media")
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                # Check that videoId is NOT exposed in public endpoint
                has_video_id = any("videoId" in item for item in data)
                if not has_video_id:
                    log_test("GET /locked-media (public) sanitized - no videoId", True, 
                           f"Found {len(data)} items, no videoId exposed")
                else:
                    log_test("GET /locked-media (public) sanitized - no videoId", False, 
                           "videoId should not be exposed in public endpoint")
            else:
                log_test("GET /locked-media (public) sanitized - no videoId", False, 
                       f"Expected array with items: {data}")
        else:
            log_test("GET /locked-media (public) sanitized - no videoId", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /locked-media (public) sanitized - no videoId", False, str(e))
    
    # Test GET admin locked-media (full)
    try:
        resp = requests.get(f"{BASE_URL}/admin/locked-media", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                # Check that videoId IS exposed in admin endpoint
                video_items = [item for item in data if item.get("kind") == "video"]
                if video_items and all("videoId" in item for item in video_items):
                    log_test("GET /admin/locked-media returns full data with videoId", True, 
                           f"Found {len(data)} items, videoId present for videos")
                else:
                    log_test("GET /admin/locked-media returns full data with videoId", False, 
                           "videoId should be present in admin endpoint for videos")
            else:
                log_test("GET /admin/locked-media returns full data with videoId", False, 
                       f"Expected array with items: {data}")
        else:
            log_test("GET /admin/locked-media returns full data with videoId", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /admin/locked-media returns full data with videoId", False, str(e))

def test_promo_codes(admin_token):
    """Test 5: PROMO CODES"""
    print("\n=== TEST 5: PROMO CODES ===")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test POST promo code - percent type
    try:
        resp = requests.post(f"{BASE_URL}/admin/promos", 
                           headers=headers,
                           json={"code": "SAVE20", "type": "percent", "value": 20, "maxUses": 2})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "SAVE20" and data.get("type") == "percent":
                log_test("POST /admin/promos with percent type", True, f"code: {data['code']}")
                cleanup_ids["promos"].append(data["id"])
            else:
                log_test("POST /admin/promos with percent type", False, f"Unexpected data: {data}")
        else:
            log_test("POST /admin/promos with percent type", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /admin/promos with percent type", False, str(e))
    
    # Test POST promo code - amount type
    try:
        resp = requests.post(f"{BASE_URL}/admin/promos", 
                           headers=headers,
                           json={"code": "TENOFF", "type": "amount", "value": 10})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "TENOFF" and data.get("type") == "amount":
                log_test("POST /admin/promos with amount type", True, f"code: {data['code']}")
                cleanup_ids["promos"].append(data["id"])
            else:
                log_test("POST /admin/promos with amount type", False, f"Unexpected data: {data}")
        else:
            log_test("POST /admin/promos with amount type", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /admin/promos with amount type", False, str(e))
    
    # Test POST promo code - bogo type
    try:
        resp = requests.post(f"{BASE_URL}/admin/promos", 
                           headers=headers,
                           json={"code": "BOGO", "type": "bogo"})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "BOGO" and data.get("type") == "bogo":
                log_test("POST /admin/promos with bogo type", True, f"code: {data['code']}")
                cleanup_ids["promos"].append(data["id"])
            else:
                log_test("POST /admin/promos with bogo type", False, f"Unexpected data: {data}")
        else:
            log_test("POST /admin/promos with bogo type", False, f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /admin/promos with bogo type", False, str(e))
    
    # Test duplicate code
    try:
        resp = requests.post(f"{BASE_URL}/admin/promos", 
                           headers=headers,
                           json={"code": "SAVE20", "type": "percent", "value": 20})
        if resp.status_code == 409:
            log_test("POST /admin/promos with duplicate code returns 409", True)
        else:
            log_test("POST /admin/promos with duplicate code returns 409", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /admin/promos with duplicate code returns 409", False, str(e))
    
    # Test validate SAVE20 (20% off)
    try:
        items = [
            {"tier": "General Admission", "qty": 2},  # 2 * 20 = 40
            {"tier": "First Row", "qty": 1}           # 1 * 30 = 30
        ]  # subtotal = 70
        resp = requests.post(f"{BASE_URL}/promo/validate", 
                           json={"code": "SAVE20", "items": items})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("valid") and data.get("discount") == 14 and data.get("total") == 56:
                log_test("POST /promo/validate SAVE20 (20% off 70 = 14 discount, total 56)", True, 
                       f"discount: {data['discount']}, total: {data['total']}")
            else:
                log_test("POST /promo/validate SAVE20 (20% off 70 = 14 discount, total 56)", False, 
                       f"Expected discount 14, total 56. Got: {data}")
        else:
            log_test("POST /promo/validate SAVE20 (20% off 70 = 14 discount, total 56)", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /promo/validate SAVE20 (20% off 70 = 14 discount, total 56)", False, str(e))
    
    # Test validate TENOFF ($10 off)
    try:
        items = [
            {"tier": "General Admission", "qty": 2},
            {"tier": "First Row", "qty": 1}
        ]  # subtotal = 70
        resp = requests.post(f"{BASE_URL}/promo/validate", 
                           json={"code": "TENOFF", "items": items})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("valid") and data.get("discount") == 10 and data.get("total") == 60:
                log_test("POST /promo/validate TENOFF ($10 off 70 = total 60)", True, 
                       f"discount: {data['discount']}, total: {data['total']}")
            else:
                log_test("POST /promo/validate TENOFF ($10 off 70 = total 60)", False, 
                       f"Expected discount 10, total 60. Got: {data}")
        else:
            log_test("POST /promo/validate TENOFF ($10 off 70 = total 60)", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /promo/validate TENOFF ($10 off 70 = total 60)", False, str(e))
    
    # Test validate BOGO (buy one get one free)
    try:
        items = [
            {"tier": "General Admission", "qty": 2},  # BOGO: 1 free = 20 discount
            {"tier": "First Row", "qty": 1}
        ]  # subtotal = 70, discount = 20, total = 50
        resp = requests.post(f"{BASE_URL}/promo/validate", 
                           json={"code": "BOGO", "items": items})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("valid") and data.get("discount") == 20 and data.get("total") == 50:
                log_test("POST /promo/validate BOGO (1 GA free = 20 discount, total 50)", True, 
                       f"discount: {data['discount']}, total: {data['total']}")
            else:
                log_test("POST /promo/validate BOGO (1 GA free = 20 discount, total 50)", False, 
                       f"Expected discount 20, total 50. Got: {data}")
        else:
            log_test("POST /promo/validate BOGO (1 GA free = 20 discount, total 50)", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /promo/validate BOGO (1 GA free = 20 discount, total 50)", False, str(e))
    
    # Test validate invalid code
    try:
        resp = requests.post(f"{BASE_URL}/promo/validate", 
                           json={"code": "INVALID", "items": [{"tier": "General Admission", "qty": 1}]})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("valid") == False:
                log_test("POST /promo/validate with invalid code returns valid:false", True)
            else:
                log_test("POST /promo/validate with invalid code returns valid:false", False, 
                       f"Expected valid:false. Got: {data}")
        else:
            log_test("POST /promo/validate with invalid code returns valid:false", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /promo/validate with invalid code returns valid:false", False, str(e))
    
    # Test toggle promo code (deactivate)
    if cleanup_ids["promos"]:
        promo_id = cleanup_ids["promos"][0]
        try:
            resp = requests.post(f"{BASE_URL}/admin/promos/{promo_id}/toggle", headers=headers)
            if resp.status_code == 200:
                # Now validate should return valid:false
                resp2 = requests.post(f"{BASE_URL}/promo/validate", 
                                    json={"code": "SAVE20", "items": [{"tier": "General Admission", "qty": 1}]})
                if resp2.status_code == 200 and resp2.json().get("valid") == False:
                    log_test("POST /admin/promos/:id/toggle then validate returns valid:false", True)
                else:
                    log_test("POST /admin/promos/:id/toggle then validate returns valid:false", False, 
                           f"Expected valid:false after toggle. Got: {resp2.json()}")
            else:
                log_test("POST /admin/promos/:id/toggle then validate returns valid:false", False, 
                       f"Toggle status {resp.status_code}")
        except Exception as e:
            log_test("POST /admin/promos/:id/toggle then validate returns valid:false", False, str(e))

def test_settings_and_ticket_limit(admin_token):
    """Test 6: SETTINGS + ticket limit enforcement"""
    print("\n=== TEST 6: SETTINGS + ticket limit ===")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test POST settings with ticketLimitPerOrder=2
    try:
        resp = requests.post(f"{BASE_URL}/admin/settings", 
                           headers=headers,
                           json={"ticketLimitPerOrder": 2})
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ticketLimitPerOrder") == 2:
                log_test("POST /admin/settings with ticketLimitPerOrder=2", True)
            else:
                log_test("POST /admin/settings with ticketLimitPerOrder=2", False, 
                       f"Expected 2, got: {data}")
        else:
            log_test("POST /admin/settings with ticketLimitPerOrder=2", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /admin/settings with ticketLimitPerOrder=2", False, str(e))
    
    # Test GET settings
    try:
        resp = requests.get(f"{BASE_URL}/admin/settings", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("ticketLimitPerOrder") == 2:
                log_test("GET /admin/settings returns ticketLimitPerOrder=2", True)
            else:
                log_test("GET /admin/settings returns ticketLimitPerOrder=2", False, 
                       f"Expected 2, got: {data}")
        else:
            log_test("GET /admin/settings returns ticketLimitPerOrder=2", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /admin/settings returns ticketLimitPerOrder=2", False, str(e))
    
    # Test create-order with qty > limit (should fail)
    try:
        resp = requests.post(f"{BASE_URL}/paypal/create-order", 
                           json={"items": [{"tier": "General Admission", "qty": 3}]})
        if resp.status_code == 400:
            error_msg = resp.json().get("error", "")
            if "at most 2 tickets" in error_msg.lower() or "2 tickets per order" in error_msg.lower():
                log_test("POST /paypal/create-order with qty 3 (limit 2) returns 400 with limit error", True, 
                       f"Error: {error_msg}")
            else:
                log_test("POST /paypal/create-order with qty 3 (limit 2) returns 400 with limit error", False, 
                       f"Expected limit error, got: {error_msg}")
        else:
            log_test("POST /paypal/create-order with qty 3 (limit 2) returns 400 with limit error", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /paypal/create-order with qty 3 (limit 2) returns 400 with limit error", False, str(e))
    
    # Test set limit back to 0 (unlimited)
    try:
        resp = requests.post(f"{BASE_URL}/admin/settings", 
                           headers=headers,
                           json={"ticketLimitPerOrder": 0})
        if resp.status_code == 200:
            log_test("POST /admin/settings with ticketLimitPerOrder=0 (unlimited)", True)
        else:
            log_test("POST /admin/settings with ticketLimitPerOrder=0 (unlimited)", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /admin/settings with ticketLimitPerOrder=0 (unlimited)", False, str(e))
    
    # Test create-order with qty 3 (should succeed now)
    try:
        resp = requests.post(f"{BASE_URL}/paypal/create-order", 
                           json={"items": [{"tier": "General Admission", "qty": 3}]})
        if resp.status_code == 200:
            data = resp.json()
            if "orderID" in data:
                log_test("POST /paypal/create-order with qty 3 (limit 0) returns orderID", True, 
                       f"orderID: {data['orderID']}")
            else:
                log_test("POST /paypal/create-order with qty 3 (limit 0) returns orderID", False, 
                       f"Missing orderID: {data}")
        else:
            log_test("POST /paypal/create-order with qty 3 (limit 0) returns orderID", False, 
                   f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /paypal/create-order with qty 3 (limit 0) returns orderID", False, str(e))
    
    # Test create-order with valid promoCode
    # First, recreate SAVE20 promo (toggle it back on if it was toggled off)
    try:
        # Get all promos
        resp = requests.get(f"{BASE_URL}/admin/promos", headers=headers)
        if resp.status_code == 200:
            promos = resp.json()
            save20 = next((p for p in promos if p.get("code") == "SAVE20"), None)
            if save20 and not save20.get("active"):
                # Toggle it back on
                requests.post(f"{BASE_URL}/admin/promos/{save20['id']}/toggle", headers=headers)
        
        # Now test create-order with promo
        resp = requests.post(f"{BASE_URL}/paypal/create-order", 
                           json={
                               "items": [{"tier": "General Admission", "qty": 2}],
                               "promoCode": "SAVE20"
                           })
        if resp.status_code == 200:
            data = resp.json()
            if "orderID" in data:
                log_test("POST /paypal/create-order with valid promoCode returns orderID", True, 
                       f"orderID: {data['orderID']}")
            else:
                log_test("POST /paypal/create-order with valid promoCode returns orderID", False, 
                       f"Missing orderID: {data}")
        else:
            log_test("POST /paypal/create-order with valid promoCode returns orderID", False, 
                   f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /paypal/create-order with valid promoCode returns orderID", False, str(e))

def test_event_commemoratives(admin_token):
    """Test 7: EVENT COMMEMORATIVES"""
    print("\n=== TEST 7: EVENT COMMEMORATIVES ===")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test POST event commemorative
    try:
        image_base64 = get_small_test_jpg()
        resp = requests.post(f"{BASE_URL}/admin/event-commemorative", 
                           headers=headers,
                           json={
                               "eventId": "inaugural-show",
                               "title": "Inaugural Commemorative",
                               "imageBase64": image_base64,
                               "contentType": "image/jpeg"
                           })
        if resp.status_code == 200:
            data = resp.json()
            if data.get("eventId") == "inaugural-show" and data.get("eventTitle") == "INAUGURAL SHOW":
                log_test("POST /admin/event-commemorative returns eventTitle 'INAUGURAL SHOW'", True, 
                       f"eventTitle: {data['eventTitle']}")
            else:
                log_test("POST /admin/event-commemorative returns eventTitle 'INAUGURAL SHOW'", False, 
                       f"Expected eventTitle 'INAUGURAL SHOW'. Got: {data}")
        else:
            log_test("POST /admin/event-commemorative returns eventTitle 'INAUGURAL SHOW'", False, 
                   f"Status {resp.status_code}: {resp.text}")
    except Exception as e:
        log_test("POST /admin/event-commemorative returns eventTitle 'INAUGURAL SHOW'", False, str(e))
    
    # Test GET event commemoratives
    try:
        resp = requests.get(f"{BASE_URL}/admin/event-commemoratives", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                inaugural = next((c for c in data if c.get("eventId") == "inaugural-show"), None)
                if inaugural:
                    log_test("GET /admin/event-commemoratives lists inaugural-show", True, 
                           f"Found {len(data)} commemoratives")
                else:
                    log_test("GET /admin/event-commemoratives lists inaugural-show", False, 
                           "inaugural-show not found in list")
            else:
                log_test("GET /admin/event-commemoratives lists inaugural-show", False, 
                       f"Expected array with items: {data}")
        else:
            log_test("GET /admin/event-commemoratives lists inaugural-show", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /admin/event-commemoratives lists inaugural-show", False, str(e))
    
    # Test POST with missing eventId
    try:
        resp = requests.post(f"{BASE_URL}/admin/event-commemorative", 
                           headers=headers,
                           json={
                               "title": "No Event",
                               "imageBase64": get_small_test_jpg(),
                               "contentType": "image/jpeg"
                           })
        if resp.status_code == 400:
            log_test("POST /admin/event-commemorative with missing eventId returns 400", True)
        else:
            log_test("POST /admin/event-commemorative with missing eventId returns 400", False, 
                   f"Status {resp.status_code}")
    except Exception as e:
        log_test("POST /admin/event-commemorative with missing eventId returns 400", False, str(e))

def test_regression():
    """Test 8: Regression tests"""
    print("\n=== TEST 8: REGRESSION ===")
    
    # Test GET /events
    try:
        resp = requests.get(f"{BASE_URL}/events")
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) == 6:
                log_test("GET /events returns 6 events", True)
            else:
                log_test("GET /events returns 6 events", False, f"Expected 6 events, got {len(data)}")
        else:
            log_test("GET /events returns 6 events", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /events returns 6 events", False, str(e))
    
    # Test GET /wrestlers
    try:
        resp = requests.get(f"{BASE_URL}/wrestlers")
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) == 8:
                log_test("GET /wrestlers returns 8 wrestlers", True)
            else:
                log_test("GET /wrestlers returns 8 wrestlers", False, f"Expected 8 wrestlers, got {len(data)}")
        else:
            log_test("GET /wrestlers returns 8 wrestlers", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /wrestlers returns 8 wrestlers", False, str(e))
    
    # Test GET /news
    try:
        resp = requests.get(f"{BASE_URL}/news")
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) == 1:
                log_test("GET /news returns 1 article", True)
            else:
                log_test("GET /news returns 1 article", False, f"Expected 1 article, got {len(data)}")
        else:
            log_test("GET /news returns 1 article", False, f"Status {resp.status_code}")
    except Exception as e:
        log_test("GET /news returns 1 article", False, str(e))

def cleanup(admin_token):
    """Clean up all test data"""
    print("\n=== CLEANUP ===")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Delete media
    for media_id in cleanup_ids["media"]:
        try:
            resp = requests.delete(f"{BASE_URL}/admin/media/{media_id}", headers=headers)
            if resp.status_code == 200:
                print(f"✅ Deleted media {media_id}")
            else:
                print(f"⚠️  Failed to delete media {media_id}: {resp.status_code}")
        except Exception as e:
            print(f"⚠️  Error deleting media {media_id}: {e}")
    
    # Delete locked media
    for lm_id in cleanup_ids["locked_media"]:
        try:
            resp = requests.delete(f"{BASE_URL}/admin/locked-media/{lm_id}", headers=headers)
            if resp.status_code == 200:
                print(f"✅ Deleted locked media {lm_id}")
            else:
                print(f"⚠️  Failed to delete locked media {lm_id}: {resp.status_code}")
        except Exception as e:
            print(f"⚠️  Error deleting locked media {lm_id}: {e}")
    
    # Delete promos
    for promo_id in cleanup_ids["promos"]:
        try:
            resp = requests.delete(f"{BASE_URL}/admin/promos/{promo_id}", headers=headers)
            if resp.status_code == 200:
                print(f"✅ Deleted promo {promo_id}")
            else:
                print(f"⚠️  Failed to delete promo {promo_id}: {resp.status_code}")
        except Exception as e:
            print(f"⚠️  Error deleting promo {promo_id}: {e}")
    
    # Delete event commemorative
    try:
        resp = requests.delete(f"{BASE_URL}/admin/event-commemoratives/inaugural-show", headers=headers)
        if resp.status_code == 200:
            print(f"✅ Deleted event commemorative inaugural-show")
        else:
            print(f"⚠️  Failed to delete event commemorative: {resp.status_code}")
    except Exception as e:
        print(f"⚠️  Error deleting event commemorative: {e}")
    
    # Verify final state
    print("\n=== FINAL STATE VERIFICATION ===")
    
    try:
        resp = requests.get(f"{BASE_URL}/media")
        media_count = len(resp.json()) if resp.status_code == 200 else -1
        print(f"Media count: {media_count} (expected: 0)")
        
        resp = requests.get(f"{BASE_URL}/locked-media")
        locked_count = len(resp.json()) if resp.status_code == 200 else -1
        print(f"Locked media count: {locked_count} (expected: 0)")
        
        resp = requests.get(f"{BASE_URL}/admin/promos", headers=headers)
        promo_count = len(resp.json()) if resp.status_code == 200 else -1
        print(f"Promo codes count: {promo_count} (expected: 0)")
        
        resp = requests.get(f"{BASE_URL}/stories")
        stories_count = len(resp.json()) if resp.status_code == 200 else -1
        print(f"Stories count: {stories_count} (expected: 0)")
        
        resp = requests.get(f"{BASE_URL}/instagram")
        ig_count = len(resp.json()) if resp.status_code == 200 else -1
        print(f"Instagram posts count: {ig_count} (expected: 0)")
        
        resp = requests.get(f"{BASE_URL}/admin/settings", headers=headers)
        ticket_limit = resp.json().get("ticketLimitPerOrder", -1) if resp.status_code == 200 else -1
        print(f"Ticket limit: {ticket_limit} (expected: 0)")
        
        resp = requests.get(f"{BASE_URL}/news")
        news_count = len(resp.json()) if resp.status_code == 200 else -1
        print(f"News count: {news_count} (expected: 1)")
        
        # Final cleanup verification
        if (media_count == 0 and locked_count == 0 and promo_count == 0 and 
            stories_count == 0 and ig_count == 0 and ticket_limit == 0 and news_count == 1):
            log_test("CLEANUP: Final state verified", True, 
                   "0 media, 0 locked-media, 0 promos, 0 stories, 0 instagram, ticketLimit=0, 1 news")
        else:
            log_test("CLEANUP: Final state verified", False, 
                   f"media={media_count}, locked={locked_count}, promos={promo_count}, stories={stories_count}, ig={ig_count}, limit={ticket_limit}, news={news_count}")
    except Exception as e:
        log_test("CLEANUP: Final state verified", False, str(e))

def main():
    """Main test execution"""
    print("=" * 80)
    print("BLACK AMETHYST WRESTLING - PHASE B BACKEND TESTS")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    print("=" * 80)
    
    # Login as admin
    admin_token = admin_login()
    if not admin_token:
        print("\n❌ CRITICAL: Admin login failed. Cannot proceed with tests.")
        sys.exit(1)
    
    # Run all tests
    test_media(admin_token)
    user_token = test_fan_auth()
    test_library(user_token)
    test_locked_media(admin_token)
    test_promo_codes(admin_token)
    test_settings_and_ticket_limit(admin_token)
    test_event_commemoratives(admin_token)
    test_regression()
    
    # Cleanup
    cleanup(admin_token)
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total tests: {test_results['passed'] + test_results['failed']}")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    
    if test_results['failed'] > 0:
        print("\nFailed tests:")
        for test in test_results['tests']:
            if not test['passed']:
                print(f"  - {test['name']}")
                if test['details']:
                    print(f"    {test['details']}")
    
    print("=" * 80)
    
    # Exit with appropriate code
    sys.exit(0 if test_results['failed'] == 0 else 1)

if __name__ == "__main__":
    main()
