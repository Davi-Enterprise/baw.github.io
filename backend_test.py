#!/usr/bin/env python3
"""
Backend API tests for Black Amethyst Wrestling - Promo Code Expiry Feature
Tests the new expiry date functionality for promo codes
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://baw-elite.preview.emergentagent.com/api"
ADMIN_PASSWORD = "@Bubba2021"

# Test state
admin_token = None
created_promo_ids = []

def log_test(test_name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"  Details: {details}")
    return passed

def admin_login():
    """Login as admin and get token"""
    global admin_token
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            admin_token = data.get("token")
            return log_test("Admin login", True, f"Token obtained")
        else:
            return log_test("Admin login", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        return log_test("Admin login", False, f"Exception: {str(e)}")

def create_promo(code, promo_type, value, expires_at=None):
    """Create a promo code"""
    try:
        payload = {
            "code": code,
            "type": promo_type,
            "value": value
        }
        if expires_at is not None:
            payload["expiresAt"] = expires_at
        
        response = requests.post(
            f"{BASE_URL}/admin/promos",
            headers={"Authorization": f"Bearer {admin_token}"},
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            promo_id = data.get("id")
            if promo_id:
                created_promo_ids.append(promo_id)
            return True, data
        else:
            return False, response.text
    except Exception as e:
        return False, str(e)

def validate_promo(code, items):
    """Validate a promo code"""
    try:
        response = requests.post(
            f"{BASE_URL}/promo/validate",
            json={"code": code, "items": items},
            timeout=10
        )
        return response.status_code, response.json()
    except Exception as e:
        return None, str(e)

def create_order(items, email, promo_code=None):
    """Create a PayPal order"""
    try:
        payload = {
            "items": items,
            "email": email
        }
        if promo_code:
            payload["promoCode"] = promo_code
        
        response = requests.post(
            f"{BASE_URL}/paypal/create-order",
            json=payload,
            timeout=10
        )
        return response.status_code, response.json()
    except Exception as e:
        return None, str(e)

def get_all_promos():
    """Get all promo codes"""
    try:
        response = requests.get(
            f"{BASE_URL}/admin/promos",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, response.text
    except Exception as e:
        return False, str(e)

def delete_promo(promo_id):
    """Delete a promo code"""
    try:
        response = requests.delete(
            f"{BASE_URL}/admin/promos/{promo_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=10
        )
        return response.status_code == 200
    except Exception as e:
        return False

def cleanup():
    """Delete all created promo codes"""
    print("\n=== CLEANUP ===")
    success_count = 0
    for promo_id in created_promo_ids:
        if delete_promo(promo_id):
            success_count += 1
    
    log_test(f"Cleanup: Deleted {success_count}/{len(created_promo_ids)} test promos", 
             success_count == len(created_promo_ids))

def run_tests():
    """Run all promo code expiry tests"""
    print("=" * 80)
    print("PROMO CODE EXPIRY DATE FEATURE - BACKEND TESTS")
    print("=" * 80)
    
    test_results = []
    
    # Login as admin
    print("\n=== SETUP ===")
    if not admin_login():
        print("❌ Cannot proceed without admin token")
        return False
    
    # Test items for validation
    test_items = [{"tier": "General Admission", "qty": 1}]
    
    # SCENARIO 1: Create promo with FUTURE expiry
    print("\n=== SCENARIO 1: Create promo with FUTURE expiry ===")
    future_date = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
    success, result = create_promo("EXPFUTURE", "percent", 20, future_date)
    
    if success:
        has_expires_at = result.get("expiresAt") is not None
        test_results.append(log_test(
            "Create EXPFUTURE promo with future expiry",
            has_expires_at,
            f"expiresAt: {result.get('expiresAt')}"
        ))
    else:
        test_results.append(log_test("Create EXPFUTURE promo", False, result))
    
    # SCENARIO 2: Validate future-dated promo (should be valid)
    print("\n=== SCENARIO 2: Validate future-dated promo ===")
    status, data = validate_promo("EXPFUTURE", test_items)
    
    if status == 200:
        is_valid = data.get("valid") == True
        has_discount = data.get("discount") == 4  # 20% off $20 = $4
        has_total = data.get("total") == 16  # $20 - $4 = $16
        
        test_results.append(log_test(
            "Validate EXPFUTURE - valid:true",
            is_valid,
            f"valid={data.get('valid')}"
        ))
        test_results.append(log_test(
            "Validate EXPFUTURE - discount:4",
            has_discount,
            f"discount={data.get('discount')}"
        ))
        test_results.append(log_test(
            "Validate EXPFUTURE - total:16",
            has_total,
            f"total={data.get('total')}"
        ))
    else:
        test_results.append(log_test("Validate EXPFUTURE", False, f"Status {status}: {data}"))
    
    # SCENARIO 3: Create promo with PAST expiry
    print("\n=== SCENARIO 3: Create promo with PAST expiry ===")
    past_date = "2020-01-01"
    success, result = create_promo("EXPPAST", "percent", 20, past_date)
    
    if success:
        test_results.append(log_test(
            "Create EXPPAST promo with past expiry",
            True,
            f"expiresAt: {result.get('expiresAt')}"
        ))
    else:
        test_results.append(log_test("Create EXPPAST promo", False, result))
    
    # SCENARIO 4: Validate expired promo (should be invalid)
    print("\n=== SCENARIO 4: Validate expired promo ===")
    status, data = validate_promo("EXPPAST", test_items)
    
    if status == 200:
        is_invalid = data.get("valid") == False
        has_expired_error = "expired" in data.get("error", "").lower()
        
        test_results.append(log_test(
            "Validate EXPPAST - valid:false",
            is_invalid,
            f"valid={data.get('valid')}"
        ))
        test_results.append(log_test(
            "Validate EXPPAST - error mentions 'expired'",
            has_expired_error,
            f"error='{data.get('error')}'"
        ))
    else:
        test_results.append(log_test("Validate EXPPAST", False, f"Status {status}: {data}"))
    
    # SCENARIO 5: Server-side enforcement on create-order with expired code
    print("\n=== SCENARIO 5: Server-side enforcement on create-order ===")
    status, data = create_order(test_items, "test@example.com", "EXPPAST")
    
    if status == 400:
        has_expired_error = "expired" in data.get("error", "").lower()
        test_results.append(log_test(
            "create-order with EXPPAST returns 400",
            True,
            f"Status {status}"
        ))
        test_results.append(log_test(
            "create-order error mentions 'expired'",
            has_expired_error,
            f"error='{data.get('error')}'"
        ))
    else:
        test_results.append(log_test(
            "create-order with EXPPAST",
            False,
            f"Expected 400, got {status}: {data}"
        ))
    
    # SCENARIO 6: Create promo with NO expiry
    print("\n=== SCENARIO 6: Create promo with NO expiry ===")
    success, result = create_promo("NOEXP", "amount", 5)
    
    if success:
        expires_at_is_null = result.get("expiresAt") is None
        test_results.append(log_test(
            "Create NOEXP promo without expiry",
            expires_at_is_null,
            f"expiresAt: {result.get('expiresAt')}"
        ))
    else:
        test_results.append(log_test("Create NOEXP promo", False, result))
    
    # Validate NOEXP (should be valid)
    status, data = validate_promo("NOEXP", test_items)
    
    if status == 200:
        is_valid = data.get("valid") == True
        has_discount = data.get("discount") == 5  # $5 off
        
        test_results.append(log_test(
            "Validate NOEXP - valid:true",
            is_valid,
            f"valid={data.get('valid')}"
        ))
        test_results.append(log_test(
            "Validate NOEXP - discount:5",
            has_discount,
            f"discount={data.get('discount')}"
        ))
    else:
        test_results.append(log_test("Validate NOEXP", False, f"Status {status}: {data}"))
    
    # SCENARIO 7: Verify GET /api/admin/promos returns all promos with expiresAt
    print("\n=== SCENARIO 7: Verify GET /api/admin/promos ===")
    success, promos = get_all_promos()
    
    if success:
        test_codes = ["EXPFUTURE", "EXPPAST", "NOEXP"]
        found_promos = [p for p in promos if p.get("code") in test_codes]
        
        test_results.append(log_test(
            "GET /admin/promos returns all created promos",
            len(found_promos) == 3,
            f"Found {len(found_promos)}/3 test promos"
        ))
        
        # Check each promo has expiresAt field
        for promo in found_promos:
            code = promo.get("code")
            has_field = "expiresAt" in promo
            
            if code == "EXPFUTURE":
                expected = promo.get("expiresAt") is not None
                test_results.append(log_test(
                    f"EXPFUTURE has non-null expiresAt",
                    expected,
                    f"expiresAt={promo.get('expiresAt')}"
                ))
            elif code == "EXPPAST":
                expected = promo.get("expiresAt") is not None
                test_results.append(log_test(
                    f"EXPPAST has non-null expiresAt",
                    expected,
                    f"expiresAt={promo.get('expiresAt')}"
                ))
            elif code == "NOEXP":
                expected = promo.get("expiresAt") is None
                test_results.append(log_test(
                    f"NOEXP has null expiresAt",
                    expected,
                    f"expiresAt={promo.get('expiresAt')}"
                ))
    else:
        test_results.append(log_test("GET /admin/promos", False, promos))
    
    # SCENARIO 8: Regression - future-dated promo works in create-order
    print("\n=== SCENARIO 8: Regression - future-dated promo in create-order ===")
    status, data = create_order(test_items, "test@example.com", "EXPFUTURE")
    
    if status == 200:
        has_order_id = "orderID" in data
        test_results.append(log_test(
            "create-order with EXPFUTURE returns orderID",
            has_order_id,
            f"orderID={data.get('orderID', 'N/A')[:20]}... (PayPal order created, NOT captured)"
        ))
    else:
        test_results.append(log_test(
            "create-order with EXPFUTURE",
            False,
            f"Expected 200, got {status}: {data}"
        ))
    
    # Cleanup
    cleanup()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(test_results)
    total = len(test_results)
    print(f"Passed: {passed}/{total} ({100*passed//total}%)")
    
    if passed == total:
        print("✅ ALL TESTS PASSED - Promo code expiry feature is working correctly")
        return True
    else:
        print(f"❌ {total - passed} TEST(S) FAILED")
        return False

if __name__ == "__main__":
    try:
        success = run_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ FATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
