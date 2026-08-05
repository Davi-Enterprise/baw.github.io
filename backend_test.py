#!/usr/bin/env python3
"""
Backend test for Admin Roster CRUD endpoints
Black Amethyst Wrestling - Admin Wrestler Management
"""
import requests
import json
import base64
import sys

# Base URL from environment
BASE_URL = "https://baw-elite.preview.emergentagent.com/api"
ADMIN_PASSWORD = "@Bubba2021"

# 1x1 pixel transparent PNG in base64 (tiny valid image for testing)
TINY_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "scenarios": []
}

def log_test(scenario, passed, message):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {scenario} - {message}")
    test_results["scenarios"].append({
        "scenario": scenario,
        "passed": passed,
        "message": message
    })
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1

def get_admin_token():
    """Get admin token via login"""
    try:
        print("\n=== Getting Admin Token ===")
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            token = data.get("token")
            print(f"✅ Admin login successful, token: {token[:20]}...")
            return token
        else:
            print(f"❌ Admin login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception during admin login: {e}")
        return None

def test_scenario_1_auth(token):
    """SCENARIO 1: AUTH - Test endpoints without Authorization header"""
    print("\n=== SCENARIO 1: AUTH TESTS ===")
    
    # Test POST without token
    try:
        response = requests.post(
            f"{BASE_URL}/admin/wrestlers",
            json={"name": "Test Wrestler"},
            timeout=10
        )
        if response.status_code == 401:
            log_test("1a. POST /admin/wrestlers without token", True, f"Correctly returned 401")
        else:
            log_test("1a. POST /admin/wrestlers without token", False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("1a. POST /admin/wrestlers without token", False, f"Exception: {e}")
    
    # Test PUT without token
    try:
        response = requests.put(
            f"{BASE_URL}/admin/wrestlers/tj-slater",
            json={"bio": "test"},
            timeout=10
        )
        if response.status_code == 401:
            log_test("1b. PUT /admin/wrestlers/:id without token", True, f"Correctly returned 401")
        else:
            log_test("1b. PUT /admin/wrestlers/:id without token", False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("1b. PUT /admin/wrestlers/:id without token", False, f"Exception: {e}")
    
    # Test DELETE without token
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/wrestlers/tj-slater",
            timeout=10
        )
        if response.status_code == 401:
            log_test("1c. DELETE /admin/wrestlers/:id without token", True, f"Correctly returned 401")
        else:
            log_test("1c. DELETE /admin/wrestlers/:id without token", False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("1c. DELETE /admin/wrestlers/:id without token", False, f"Exception: {e}")

def test_scenario_2_validation(token):
    """SCENARIO 2: VALIDATION - Test POST with missing required field (name)"""
    print("\n=== SCENARIO 2: VALIDATION TESTS ===")
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/wrestlers",
            json={"nickname": "x"},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        if response.status_code == 400:
            data = response.json()
            error = data.get("error", "")
            if "name" in error.lower() or "required" in error.lower():
                log_test("2. POST without name field", True, f"Correctly returned 400 with error: {error}")
            else:
                log_test("2. POST without name field", False, f"Got 400 but error message unclear: {error}")
        else:
            log_test("2. POST without name field", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("2. POST without name field", False, f"Exception: {e}")

def test_scenario_3_create(token):
    """SCENARIO 3: CREATE - Create a new wrestler with full data"""
    print("\n=== SCENARIO 3: CREATE WRESTLER ===")
    
    created_id = None
    
    try:
        # Create wrestler
        response = requests.post(
            f"{BASE_URL}/admin/wrestlers",
            json={
                "name": "Test Grappler",
                "nickname": "The Tester",
                "bio": "A test wrestler bio.",
                "imageBase64": TINY_PNG_BASE64,
                "contentType": "image/png"
            },
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            created_id = data.get("id")
            name = data.get("name")
            nickname = data.get("nickname")
            bio = data.get("bio")
            category = data.get("category")
            champion = data.get("champion")
            image = data.get("image")
            
            # Verify response structure
            checks = []
            checks.append(("id exists", created_id is not None))
            checks.append(("name uppercased", name == "TEST GRAPPLER"))
            checks.append(("nickname preserved", nickname == "The Tester"))
            checks.append(("bio preserved", bio == "A test wrestler bio."))
            checks.append(("category is men", category == "men"))
            checks.append(("champion is false", champion == False))
            checks.append(("image path starts with /api/asset/wr-", image and image.startswith("/api/asset/wr-")))
            
            all_passed = all(check[1] for check in checks)
            failed_checks = [check[0] for check in checks if not check[1]]
            
            if all_passed:
                log_test("3a. POST create wrestler", True, f"Created wrestler with id: {created_id}")
            else:
                log_test("3a. POST create wrestler", False, f"Failed checks: {', '.join(failed_checks)}")
        else:
            log_test("3a. POST create wrestler", False, f"Expected 200, got {response.status_code}: {response.text}")
            return None
        
        # Verify in GET /api/wrestlers list
        response = requests.get(f"{BASE_URL}/wrestlers", timeout=10)
        if response.status_code == 200:
            wrestlers = response.json()
            count = len(wrestlers)
            found = any(w.get("id") == created_id for w in wrestlers)
            if count == 9 and found:
                log_test("3b. GET /wrestlers includes new wrestler", True, f"Count is 9 (8 seeded + 1 new), new wrestler found")
            else:
                log_test("3b. GET /wrestlers includes new wrestler", False, f"Count: {count} (expected 9), found: {found}")
        else:
            log_test("3b. GET /wrestlers includes new wrestler", False, f"GET failed: {response.status_code}")
        
        # Verify image path returns 200
        if created_id:
            image_path = f"/asset/wr-{created_id}.png"
            response = requests.get(f"{BASE_URL}{image_path}", timeout=10)
            if response.status_code == 200:
                content_type = response.headers.get("Content-Type", "")
                if "image" in content_type:
                    log_test("3c. GET image path returns 200 with image content-type", True, f"Content-Type: {content_type}")
                else:
                    log_test("3c. GET image path returns 200 with image content-type", False, f"Wrong Content-Type: {content_type}")
            else:
                log_test("3c. GET image path returns 200 with image content-type", False, f"Expected 200, got {response.status_code}")
        
        # Verify GET /api/wrestlers/:id detail
        if created_id:
            response = requests.get(f"{BASE_URL}/wrestlers/{created_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                bio = data.get("bio")
                nickname = data.get("nickname")
                if bio == "A test wrestler bio." and nickname == "The Tester":
                    log_test("3d. GET /wrestlers/:id returns correct bio and nickname", True, f"Bio and nickname match")
                else:
                    log_test("3d. GET /wrestlers/:id returns correct bio and nickname", False, f"Bio: {bio}, Nickname: {nickname}")
            else:
                log_test("3d. GET /wrestlers/:id returns correct bio and nickname", False, f"Expected 200, got {response.status_code}")
        
        return created_id
        
    except Exception as e:
        log_test("3. CREATE wrestler", False, f"Exception: {e}")
        return None

def test_scenario_4_update_created(token, wrestler_id):
    """SCENARIO 4: UPDATE - Update the created wrestler"""
    print("\n=== SCENARIO 4: UPDATE CREATED WRESTLER ===")
    
    if not wrestler_id:
        log_test("4. UPDATE created wrestler", False, "No wrestler_id provided (creation failed)")
        return
    
    try:
        # Update bio and nickname
        response = requests.put(
            f"{BASE_URL}/admin/wrestlers/{wrestler_id}",
            json={
                "bio": "Updated bio text",
                "nickname": "Updated Nick"
            },
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            log_test("4a. PUT update wrestler", True, f"Update returned 200")
        else:
            log_test("4a. PUT update wrestler", False, f"Expected 200, got {response.status_code}")
            return
        
        # Verify changes via GET
        response = requests.get(f"{BASE_URL}/wrestlers/{wrestler_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            bio = data.get("bio")
            nickname = data.get("nickname")
            image = data.get("image")
            
            checks = []
            checks.append(("bio updated", bio == "Updated bio text"))
            checks.append(("nickname updated", nickname == "Updated Nick"))
            checks.append(("image unchanged", image and image.startswith("/api/asset/wr-")))
            
            all_passed = all(check[1] for check in checks)
            failed_checks = [check[0] for check in checks if not check[1]]
            
            if all_passed:
                log_test("4b. GET verifies updated bio/nickname, image unchanged", True, "All fields correct")
            else:
                log_test("4b. GET verifies updated bio/nickname, image unchanged", False, f"Failed: {', '.join(failed_checks)}")
        else:
            log_test("4b. GET verifies updated bio/nickname, image unchanged", False, f"GET failed: {response.status_code}")
            
    except Exception as e:
        log_test("4. UPDATE created wrestler", False, f"Exception: {e}")

def test_scenario_5_update_seeded(token):
    """SCENARIO 5: UPDATE A SEEDED WRESTLER - Update tj-slater then restore"""
    print("\n=== SCENARIO 5: UPDATE SEEDED WRESTLER (tj-slater) ===")
    
    try:
        # Update tj-slater with temp bio
        response = requests.put(
            f"{BASE_URL}/admin/wrestlers/tj-slater",
            json={"bio": "TEMP TEST BIO"},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            log_test("5a. PUT tj-slater with temp bio", True, "Update returned 200")
        else:
            log_test("5a. PUT tj-slater with temp bio", False, f"Expected 200, got {response.status_code}")
            return
        
        # Verify temp bio
        response = requests.get(f"{BASE_URL}/wrestlers/tj-slater", timeout=10)
        if response.status_code == 200:
            data = response.json()
            bio = data.get("bio")
            name = data.get("name")
            
            if bio == "TEMP TEST BIO" and name == "TJ SLATER":
                log_test("5b. GET tj-slater shows temp bio, name unchanged", True, f"Bio: {bio}, Name: {name}")
            else:
                log_test("5b. GET tj-slater shows temp bio, name unchanged", False, f"Bio: {bio}, Name: {name}")
        else:
            log_test("5b. GET tj-slater shows temp bio, name unchanged", False, f"GET failed: {response.status_code}")
        
        # RESTORE: clear bio back to empty
        response = requests.put(
            f"{BASE_URL}/admin/wrestlers/tj-slater",
            json={"bio": ""},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            log_test("5c. PUT tj-slater restore bio to empty", True, "Restore returned 200")
        else:
            log_test("5c. PUT tj-slater restore bio to empty", False, f"Expected 200, got {response.status_code}")
            return
        
        # Verify bio is now empty
        response = requests.get(f"{BASE_URL}/wrestlers/tj-slater", timeout=10)
        if response.status_code == 200:
            data = response.json()
            bio = data.get("bio", "")
            
            if bio == "":
                log_test("5d. GET tj-slater bio is now empty", True, "Bio restored to empty")
            else:
                log_test("5d. GET tj-slater bio is now empty", False, f"Bio not empty: '{bio}'")
        else:
            log_test("5d. GET tj-slater bio is now empty", False, f"GET failed: {response.status_code}")
            
    except Exception as e:
        log_test("5. UPDATE seeded wrestler", False, f"Exception: {e}")

def test_scenario_6_put_bad_id(token):
    """SCENARIO 6: PUT BAD ID - Update non-existent wrestler"""
    print("\n=== SCENARIO 6: PUT BAD ID ===")
    
    try:
        response = requests.put(
            f"{BASE_URL}/admin/wrestlers/does-not-exist-id",
            json={"bio": "x"},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 404:
            log_test("6. PUT non-existent wrestler id", True, "Correctly returned 404")
        else:
            log_test("6. PUT non-existent wrestler id", False, f"Expected 404, got {response.status_code}")
            
    except Exception as e:
        log_test("6. PUT bad id", False, f"Exception: {e}")

def test_scenario_7_delete(token, wrestler_id):
    """SCENARIO 7: DELETE - Delete the created wrestler"""
    print("\n=== SCENARIO 7: DELETE WRESTLER ===")
    
    if not wrestler_id:
        log_test("7. DELETE wrestler", False, "No wrestler_id provided (creation failed)")
        return
    
    try:
        # Delete wrestler
        response = requests.delete(
            f"{BASE_URL}/admin/wrestlers/{wrestler_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 200:
            log_test("7a. DELETE wrestler", True, "Delete returned 200")
        else:
            log_test("7a. DELETE wrestler", False, f"Expected 200, got {response.status_code}")
            return
        
        # Verify not in list (count back to 8)
        response = requests.get(f"{BASE_URL}/wrestlers", timeout=10)
        if response.status_code == 200:
            wrestlers = response.json()
            count = len(wrestlers)
            found = any(w.get("id") == wrestler_id for w in wrestlers)
            
            if count == 8 and not found:
                log_test("7b. GET /wrestlers no longer includes deleted wrestler", True, f"Count back to 8, wrestler not found")
            else:
                log_test("7b. GET /wrestlers no longer includes deleted wrestler", False, f"Count: {count}, found: {found}")
        else:
            log_test("7b. GET /wrestlers no longer includes deleted wrestler", False, f"GET failed: {response.status_code}")
        
        # Verify GET /wrestlers/:id returns 404
        response = requests.get(f"{BASE_URL}/wrestlers/{wrestler_id}", timeout=10)
        if response.status_code == 404:
            log_test("7c. GET /wrestlers/:id returns 404", True, "Correctly returned 404")
        else:
            log_test("7c. GET /wrestlers/:id returns 404", False, f"Expected 404, got {response.status_code}")
            
    except Exception as e:
        log_test("7. DELETE wrestler", False, f"Exception: {e}")

def test_scenario_8_regression(token):
    """SCENARIO 8: REGRESSION - Verify 8 original seeded wrestlers with authentic data"""
    print("\n=== SCENARIO 8: REGRESSION TESTS ===")
    
    # Expected seeded wrestlers with their original data
    expected_wrestlers = {
        "tj-slater": {"name": "TJ SLATER", "nickname": "", "bio": ""},
        "arik-walker": {"name": "ARIK WALKER", "nickname": "", "bio": ""},
        "dangelo-leflame": {"name": "D'ANGELO LE FLAME", "nickname": "", "bio": ""},
        "alex-rey": {"name": "ALEX REY", "nickname": "", "bio": ""},
        "big-haus": {"name": "BIG HAUS", "nickname": "", "bio": ""},
        "draco": {"name": "DRACO", "nickname": "The Last Dragon", "bio": ""},
        "james-derek": {"name": "JAMES DEREK", "nickname": "Da Product", "bio": ""},
        "rakzo-moreno": {"name": "RAKZO MORENO", "nickname": "", "bio": ""}
    }
    
    try:
        response = requests.get(f"{BASE_URL}/wrestlers", timeout=10)
        if response.status_code != 200:
            log_test("8. REGRESSION - GET /wrestlers", False, f"GET failed: {response.status_code}")
            return
        
        wrestlers = response.json()
        count = len(wrestlers)
        
        # Check count
        if count != 8:
            log_test("8a. REGRESSION - wrestler count", False, f"Expected 8, got {count}")
        else:
            log_test("8a. REGRESSION - wrestler count", True, "Exactly 8 wrestlers")
        
        # Check all expected IDs present
        wrestler_ids = {w.get("id") for w in wrestlers}
        expected_ids = set(expected_wrestlers.keys())
        
        if wrestler_ids == expected_ids:
            log_test("8b. REGRESSION - all original IDs present", True, "All 8 original wrestler IDs found")
        else:
            missing = expected_ids - wrestler_ids
            extra = wrestler_ids - expected_ids
            log_test("8b. REGRESSION - all original IDs present", False, f"Missing: {missing}, Extra: {extra}")
        
        # Check each wrestler's data
        all_data_correct = True
        issues = []
        
        for wrestler in wrestlers:
            wid = wrestler.get("id")
            if wid in expected_wrestlers:
                expected = expected_wrestlers[wid]
                name = wrestler.get("name")
                nickname = wrestler.get("nickname", "")
                bio = wrestler.get("bio", "")
                
                if name != expected["name"]:
                    all_data_correct = False
                    issues.append(f"{wid}: name '{name}' != '{expected['name']}'")
                
                if nickname != expected["nickname"]:
                    all_data_correct = False
                    issues.append(f"{wid}: nickname '{nickname}' != '{expected['nickname']}'")
                
                if bio != expected["bio"]:
                    all_data_correct = False
                    issues.append(f"{wid}: bio '{bio}' != '{expected['bio']}'")
        
        if all_data_correct:
            log_test("8c. REGRESSION - all wrestler data authentic", True, "All names, nicknames, and bios match original seed data")
        else:
            log_test("8c. REGRESSION - all wrestler data authentic", False, f"Data mismatches: {'; '.join(issues)}")
            
    except Exception as e:
        log_test("8. REGRESSION tests", False, f"Exception: {e}")

def main():
    """Main test execution"""
    print("=" * 80)
    print("BLACK AMETHYST WRESTLING - ADMIN ROSTER CRUD BACKEND TESTS")
    print("=" * 80)
    
    # Get admin token
    token = get_admin_token()
    if not token:
        print("\n❌ CRITICAL: Failed to get admin token. Cannot proceed with tests.")
        sys.exit(1)
    
    # Run all test scenarios
    test_scenario_1_auth(token)
    test_scenario_2_validation(token)
    created_wrestler_id = test_scenario_3_create(token)
    test_scenario_4_update_created(token, created_wrestler_id)
    test_scenario_5_update_seeded(token)
    test_scenario_6_put_bad_id(token)
    test_scenario_7_delete(token, created_wrestler_id)
    test_scenario_8_regression(token)
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    total = test_results["passed"] + test_results["failed"]
    print(f"Total Tests: {total}")
    print(f"Passed: {test_results['passed']} ✅")
    print(f"Failed: {test_results['failed']} ❌")
    
    if test_results["failed"] == 0:
        print("\n🎉 ALL TESTS PASSED! Admin Roster CRUD is production-ready.")
    else:
        print("\n⚠️  SOME TESTS FAILED. Review the output above for details.")
        print("\nFailed scenarios:")
        for scenario in test_results["scenarios"]:
            if not scenario["passed"]:
                print(f"  - {scenario['scenario']}: {scenario['message']}")
    
    print("=" * 80)
    
    # Exit with appropriate code
    sys.exit(0 if test_results["failed"] == 0 else 1)

if __name__ == "__main__":
    main()
