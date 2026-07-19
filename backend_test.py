#!/usr/bin/env python3
"""
Backend API Test Suite for Black Amethyst Wrestling
Tests the reworked ASSET DELIVERY route and regression tests
"""

import requests
import sys
import os
from pymongo import MongoClient

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://baw-elite.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'your_database_name')

print(f"Testing against: {API_BASE}")
print(f"MongoDB: {MONGO_URL}/{DB_NAME}")
print("=" * 80)

# Test results tracking
tests_passed = 0
tests_failed = 0
test_results = []

def test_result(test_name, passed, message=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        status = "✅ PASS"
    else:
        tests_failed += 1
        status = "❌ FAIL"
    result = f"{status}: {test_name}"
    if message:
        result += f" - {message}"
    print(result)
    test_results.append((test_name, passed, message))
    return passed

print("\n" + "=" * 80)
print("TEST 1: Asset Delivery - 11 Required Files")
print("=" * 80)

# List of required assets with expected content types
required_assets = [
    ("logo-t.png", "image/png"),
    ("tj-slater.png", "image/jpeg"),
    ("arik-walker.png", "image/jpeg"),
    ("dangelo-leflame.png", "image/jpeg"),
    ("alex-rey.png", "image/jpeg"),
    ("draco.png", "image/jpeg"),
    ("inaugural-poster.png", "image/jpeg"),
    ("big-haus.jpeg", "image/jpeg"),
    ("schedule-poster.jpeg", "image/jpeg"),
    ("james-derek.webp", "image/jpeg"),
    ("rakzo-moreno.webp", "image/jpeg"),
]

asset_test_results = []

for filename, expected_content_type in required_assets:
    try:
        url = f"{API_BASE}/asset/{filename}"
        response = requests.get(url, timeout=10)
        
        # Check status code
        status_ok = response.status_code == 200
        
        # Check content type
        content_type = response.headers.get('Content-Type', '')
        content_type_ok = content_type.startswith('image/')
        
        # Check body size (should be > 1KB)
        body_size = len(response.content)
        size_ok = body_size > 1024
        
        all_ok = status_ok and content_type_ok and size_ok
        
        if all_ok:
            message = f"Status: {response.status_code}, Type: {content_type}, Size: {body_size} bytes"
        else:
            issues = []
            if not status_ok:
                issues.append(f"Status: {response.status_code}")
            if not content_type_ok:
                issues.append(f"Type: {content_type}")
            if not size_ok:
                issues.append(f"Size: {body_size} bytes")
            message = ", ".join(issues)
        
        test_result(f"Asset: {filename}", all_ok, message)
        asset_test_results.append((filename, all_ok))
        
    except Exception as e:
        test_result(f"Asset: {filename}", False, f"Exception: {str(e)}")
        asset_test_results.append((filename, False))

print("\n" + "=" * 80)
print("TEST 2: Non-existent Asset (404)")
print("=" * 80)

try:
    url = f"{API_BASE}/asset/does-not-exist.png"
    response = requests.get(url, timeout=10)
    
    is_404 = response.status_code == 404
    test_result("Non-existent asset returns 404", is_404, f"Status: {response.status_code}")
    
except Exception as e:
    test_result("Non-existent asset returns 404", False, f"Exception: {str(e)}")

print("\n" + "=" * 80)
print("TEST 3: Path Traversal Safety")
print("=" * 80)

try:
    url = f"{API_BASE}/asset/../package.json"
    response = requests.get(url, timeout=10)
    
    # Should return 404 or not return package.json content
    is_safe = response.status_code == 404 or 'package.json' not in response.text
    
    if response.status_code == 404:
        message = "Returns 404 (safe)"
    elif 'package.json' in response.text:
        message = "⚠️ SECURITY ISSUE: Returns package.json content"
    else:
        message = f"Returns {response.status_code} with no sensitive data"
    
    test_result("Path traversal blocked", is_safe, message)
    
except Exception as e:
    test_result("Path traversal blocked", False, f"Exception: {str(e)}")

print("\n" + "=" * 80)
print("TEST 4: MongoDB Assets Collection Seeding")
print("=" * 80)

try:
    # First, trigger seeding by calling /api/events
    events_url = f"{API_BASE}/events"
    events_response = requests.get(events_url, timeout=10)
    
    if events_response.status_code != 200:
        test_result("Trigger seeding via /api/events", False, f"Status: {events_response.status_code}")
    else:
        test_result("Trigger seeding via /api/events", True, "Status: 200")
    
    # Connect to MongoDB
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Check assets collection
    assets_count = db.assets.count_documents({})
    
    has_11_assets = assets_count == 11
    test_result("MongoDB assets collection has 11 documents", has_11_assets, f"Count: {assets_count}")
    
    # Verify each asset has required fields
    if assets_count > 0:
        sample_asset = db.assets.find_one()
        has_fields = all(field in sample_asset for field in ['filename', 'contentType', 'data'])
        test_result("Assets have required fields (filename, contentType, data)", has_fields, 
                   f"Fields: {list(sample_asset.keys())}")
    
    client.close()
    
except Exception as e:
    test_result("MongoDB assets collection check", False, f"Exception: {str(e)}")

print("\n" + "=" * 80)
print("TEST 5: Regression - Events API")
print("=" * 80)

try:
    url = f"{API_BASE}/events"
    response = requests.get(url, timeout=10)
    
    status_ok = response.status_code == 200
    test_result("GET /api/events returns 200", status_ok, f"Status: {response.status_code}")
    
    if status_ok:
        events = response.json()
        
        # Check count
        has_6_events = len(events) == 6
        test_result("Returns 6 events", has_6_events, f"Count: {len(events)}")
        
        # Check first event is inaugural-show
        if len(events) > 0:
            first_is_inaugural = events[0].get('id') == 'inaugural-show'
            test_result("First event is 'inaugural-show'", first_is_inaugural, 
                       f"First ID: {events[0].get('id')}")
            
            # Check status
            first_status = events[0].get('status') == 'on-sale'
            test_result("First event status is 'on-sale'", first_status, 
                       f"Status: {events[0].get('status')}")
        
        # Verify sorted by date ascending
        if len(events) >= 2:
            dates = [e.get('date') for e in events]
            is_sorted = dates == sorted(dates)
            test_result("Events sorted by date ascending", is_sorted, 
                       f"First: {dates[0]}, Last: {dates[-1]}")
    
except Exception as e:
    test_result("GET /api/events", False, f"Exception: {str(e)}")

print("\n" + "=" * 80)
print("TEST 6: Regression - Wrestlers API")
print("=" * 80)

try:
    url = f"{API_BASE}/wrestlers"
    response = requests.get(url, timeout=10)
    
    status_ok = response.status_code == 200
    test_result("GET /api/wrestlers returns 200", status_ok, f"Status: {response.status_code}")
    
    if status_ok:
        wrestlers = response.json()
        
        # Check count
        has_8_wrestlers = len(wrestlers) == 8
        test_result("Returns 8 wrestlers", has_8_wrestlers, f"Count: {len(wrestlers)}")
        
        # Check all are category 'men'
        if len(wrestlers) > 0:
            all_men = all(w.get('category') == 'men' for w in wrestlers)
            test_result("All wrestlers category 'men'", all_men, 
                       f"Categories: {set(w.get('category') for w in wrestlers)}")
            
            # Check all champion false
            all_not_champion = all(w.get('champion') == False for w in wrestlers)
            test_result("All wrestlers champion=false", all_not_champion, 
                       f"Champions: {[w.get('champion') for w in wrestlers]}")
    
except Exception as e:
    test_result("GET /api/wrestlers", False, f"Exception: {str(e)}")

print("\n" + "=" * 80)
print("TEST 7: Regression - News API")
print("=" * 80)

try:
    url = f"{API_BASE}/news"
    response = requests.get(url, timeout=10)
    
    status_ok = response.status_code == 200
    test_result("GET /api/news returns 200", status_ok, f"Status: {response.status_code}")
    
    if status_ok:
        news = response.json()
        
        # Check count
        has_1_article = len(news) == 1
        test_result("Returns exactly 1 article", has_1_article, f"Count: {len(news)}")
        
        # Check it's the inaugural announcement
        if len(news) > 0:
            is_inaugural = news[0].get('id') == 'inaugural-announcement'
            test_result("Article is 'inaugural-announcement'", is_inaugural, 
                       f"ID: {news[0].get('id')}")
    
except Exception as e:
    test_result("GET /api/news", False, f"Exception: {str(e)}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)

print(f"\nTotal Tests: {tests_passed + tests_failed}")
print(f"✅ Passed: {tests_passed}")
print(f"❌ Failed: {tests_failed}")

# Asset delivery summary
asset_passed = sum(1 for _, passed in asset_test_results if passed)
asset_failed = len(asset_test_results) - asset_passed
print(f"\nAsset Delivery: {asset_passed}/{len(required_assets)} files working")

if tests_failed > 0:
    print("\n⚠️ SOME TESTS FAILED")
    print("\nFailed tests:")
    for test_name, passed, message in test_results:
        if not passed:
            print(f"  - {test_name}: {message}")
    sys.exit(1)
else:
    print("\n✅ ALL TESTS PASSED")
    sys.exit(0)
