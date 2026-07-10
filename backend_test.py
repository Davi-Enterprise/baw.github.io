#!/usr/bin/env python3
"""
Backend API Test Suite for Black Amethyst Wrestling
Tests all API endpoints with validation
"""

import requests
import json
from datetime import datetime
from pymongo import MongoClient
import os

# Base URL from environment
BASE_URL = "https://baw-elite.preview.emergentagent.com/api"

# MongoDB connection for verification
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'your_database_name')

def print_test_header(test_name):
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(passed, message):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")

def test_events_list():
    """Test GET /api/events - should return array of events sorted by date"""
    print_test_header("GET /api/events - Events List")
    
    try:
        response = requests.get(f"{BASE_URL}/events", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response type: {type(data)}")
        print(f"Number of events: {len(data)}")
        
        # Check if it's an array
        if not isinstance(data, list):
            print_result(False, "Response is not an array")
            return False
        
        # Check minimum count
        if len(data) < 4:
            print_result(False, f"Expected at least 4 events, got {len(data)}")
            return False
        
        # Check first event structure
        first_event = data[0]
        required_fields = ['id', 'title', 'tagline', 'date', 'time', 'doorsOpen', 
                          'venue', 'location', 'address', 'poster', 'banner', 
                          'status', 'description', 'matches', 'parking', 'vip', 'faq']
        
        missing_fields = [f for f in required_fields if f not in first_event]
        if missing_fields:
            print_result(False, f"Missing fields: {missing_fields}")
            return False
        
        # Check no MongoDB _id
        if '_id' in first_event:
            print_result(False, "MongoDB _id field present in response")
            return False
        
        # Check sorting (ascending by date)
        dates = [datetime.fromisoformat(e['date'].replace('Z', '+00:00')) for e in data]
        is_sorted = all(dates[i] <= dates[i+1] for i in range(len(dates)-1))
        if not is_sorted:
            print_result(False, "Events not sorted by date (ascending)")
            return False
        
        # Check matches is array
        if not isinstance(first_event['matches'], list):
            print_result(False, "matches field is not an array")
            return False
        
        # Check faq is array
        if not isinstance(first_event['faq'], list):
            print_result(False, "faq field is not an array")
            return False
        
        print(f"Sample event ID: {first_event['id']}")
        print(f"Sample event title: {first_event['title']}")
        print_result(True, f"Events list endpoint working correctly with {len(data)} events")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_event_detail():
    """Test GET /api/events/:id - should return single event"""
    print_test_header("GET /api/events/amethyst-rising - Event Detail")
    
    try:
        response = requests.get(f"{BASE_URL}/events/amethyst-rising", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response type: {type(data)}")
        
        # Check if it's an object (not array)
        if isinstance(data, list):
            print_result(False, "Response is an array, expected single object")
            return False
        
        # Check required fields
        required_fields = ['id', 'title', 'matches', 'faq']
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            print_result(False, f"Missing fields: {missing_fields}")
            return False
        
        # Check no MongoDB _id
        if '_id' in data:
            print_result(False, "MongoDB _id field present in response")
            return False
        
        # Check matches and faq are arrays
        if not isinstance(data['matches'], list):
            print_result(False, "matches field is not an array")
            return False
        
        if not isinstance(data['faq'], list):
            print_result(False, "faq field is not an array")
            return False
        
        print(f"Event ID: {data['id']}")
        print(f"Event title: {data['title']}")
        print(f"Matches count: {len(data['matches'])}")
        print(f"FAQ count: {len(data['faq'])}")
        print_result(True, "Event detail endpoint working correctly")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_event_not_found():
    """Test GET /api/events/nonexistent-id - should return 404"""
    print_test_header("GET /api/events/nonexistent-id - Event Not Found")
    
    try:
        response = requests.get(f"{BASE_URL}/events/nonexistent-id", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 404:
            print_result(False, f"Expected 404, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check for error field
        if 'error' not in data:
            print_result(False, "Response missing 'error' field")
            return False
        
        print(f"Error message: {data['error']}")
        print_result(True, "Event not found returns 404 correctly")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_wrestlers_list():
    """Test GET /api/wrestlers - should return array of wrestlers"""
    print_test_header("GET /api/wrestlers - Wrestlers List")
    
    try:
        response = requests.get(f"{BASE_URL}/wrestlers", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response type: {type(data)}")
        print(f"Number of wrestlers: {len(data)}")
        
        # Check if it's an array
        if not isinstance(data, list):
            print_result(False, "Response is not an array")
            return False
        
        # Check minimum count
        if len(data) < 8:
            print_result(False, f"Expected at least 8 wrestlers, got {len(data)}")
            return False
        
        # Check first wrestler structure
        first_wrestler = data[0]
        required_fields = ['id', 'name', 'nickname', 'category', 'champion', 
                          'championship', 'image', 'height', 'weight', 'hometown', 
                          'debut', 'finisher', 'signatures', 'bio']
        
        missing_fields = [f for f in required_fields if f not in first_wrestler]
        if missing_fields:
            print_result(False, f"Missing fields: {missing_fields}")
            return False
        
        # Check no MongoDB _id
        if '_id' in first_wrestler:
            print_result(False, "MongoDB _id field present in response")
            return False
        
        # Check category values
        valid_categories = ['men', 'women', 'tag']
        categories = [w['category'] for w in data]
        invalid_cats = [c for c in categories if c not in valid_categories]
        if invalid_cats:
            print_result(False, f"Invalid categories found: {invalid_cats}")
            return False
        
        # Check champion is boolean
        if not isinstance(first_wrestler['champion'], bool):
            print_result(False, "champion field is not boolean")
            return False
        
        # Check signatures is array
        if not isinstance(first_wrestler['signatures'], list):
            print_result(False, "signatures field is not an array")
            return False
        
        print(f"Sample wrestler ID: {first_wrestler['id']}")
        print(f"Sample wrestler name: {first_wrestler['name']}")
        print(f"Categories found: {set(categories)}")
        print_result(True, f"Wrestlers list endpoint working correctly with {len(data)} wrestlers")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_wrestler_detail():
    """Test GET /api/wrestlers/:id - should return single wrestler"""
    print_test_header("GET /api/wrestlers/obsidian-king - Wrestler Detail")
    
    try:
        response = requests.get(f"{BASE_URL}/wrestlers/obsidian-king", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response type: {type(data)}")
        
        # Check if it's an object (not array)
        if isinstance(data, list):
            print_result(False, "Response is an array, expected single object")
            return False
        
        # Check required fields
        required_fields = ['id', 'name', 'nickname', 'category', 'champion']
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            print_result(False, f"Missing fields: {missing_fields}")
            return False
        
        # Check no MongoDB _id
        if '_id' in data:
            print_result(False, "MongoDB _id field present in response")
            return False
        
        print(f"Wrestler ID: {data['id']}")
        print(f"Wrestler name: {data['name']}")
        print(f"Champion: {data['champion']}")
        print_result(True, "Wrestler detail endpoint working correctly")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_wrestler_not_found():
    """Test GET /api/wrestlers/bad-id - should return 404"""
    print_test_header("GET /api/wrestlers/bad-id - Wrestler Not Found")
    
    try:
        response = requests.get(f"{BASE_URL}/wrestlers/bad-id", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 404:
            print_result(False, f"Expected 404, got {response.status_code}")
            return False
        
        data = response.json()
        
        # Check for error field
        if 'error' not in data:
            print_result(False, "Response missing 'error' field")
            return False
        
        print(f"Error message: {data['error']}")
        print_result(True, "Wrestler not found returns 404 correctly")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_news_list():
    """Test GET /api/news - should return array of news sorted by date descending"""
    print_test_header("GET /api/news - News List")
    
    try:
        response = requests.get(f"{BASE_URL}/news", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response type: {type(data)}")
        print(f"Number of news articles: {len(data)}")
        
        # Check if it's an array
        if not isinstance(data, list):
            print_result(False, "Response is not an array")
            return False
        
        # Check minimum count
        if len(data) < 6:
            print_result(False, f"Expected at least 6 news articles, got {len(data)}")
            return False
        
        # Check first news structure
        first_news = data[0]
        required_fields = ['id', 'category', 'title', 'excerpt', 'date', 'image', 'author']
        
        missing_fields = [f for f in required_fields if f not in first_news]
        if missing_fields:
            print_result(False, f"Missing fields: {missing_fields}")
            return False
        
        # Check no MongoDB _id
        if '_id' in first_news:
            print_result(False, "MongoDB _id field present in response")
            return False
        
        # Check sorting (descending by date - newest first)
        dates = [datetime.fromisoformat(n['date'].replace('Z', '+00:00')) for n in data]
        is_sorted = all(dates[i] >= dates[i+1] for i in range(len(dates)-1))
        if not is_sorted:
            print_result(False, "News not sorted by date (descending/newest first)")
            return False
        
        print(f"Sample news ID: {first_news['id']}")
        print(f"Sample news title: {first_news['title']}")
        print(f"Sample news category: {first_news['category']}")
        print_result(True, f"News list endpoint working correctly with {len(data)} articles")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_newsletter_signup_success():
    """Test POST /api/newsletter with valid email"""
    print_test_header("POST /api/newsletter - Valid Email")
    
    try:
        payload = {"email": "fan@example.com"}
        response = requests.post(f"{BASE_URL}/newsletter", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Request payload: {json.dumps(payload)}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check for message and id fields
        if 'message' not in data:
            print_result(False, "Response missing 'message' field")
            return False
        
        if 'id' not in data:
            print_result(False, "Response missing 'id' field")
            return False
        
        # Verify id is a string (UUID format)
        if not isinstance(data['id'], str):
            print_result(False, "ID is not a string")
            return False
        
        print(f"Subscription ID: {data['id']}")
        print_result(True, "Newsletter signup successful with valid email")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_newsletter_signup_missing_email():
    """Test POST /api/newsletter with missing email"""
    print_test_header("POST /api/newsletter - Missing Email")
    
    try:
        payload = {}
        response = requests.post(f"{BASE_URL}/newsletter", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Request payload: {json.dumps(payload)}")
        
        if response.status_code != 400:
            print_result(False, f"Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check for error field
        if 'error' not in data:
            print_result(False, "Response missing 'error' field")
            return False
        
        # Check error message mentions email
        if 'email' not in data['error'].lower():
            print_result(False, "Error message doesn't mention email")
            return False
        
        print(f"Error message: {data['error']}")
        print_result(True, "Newsletter signup correctly rejects missing email with 400")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_contact_form_success():
    """Test POST /api/contact with valid data"""
    print_test_header("POST /api/contact - Valid Data")
    
    try:
        payload = {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "123-456-7890",
            "subject": "Booking Requests",
            "message": "Hello, I would like to inquire about booking information."
        }
        response = requests.post(f"{BASE_URL}/contact", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Request payload: {json.dumps(payload, indent=2)}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check for message and id fields
        if 'message' not in data:
            print_result(False, "Response missing 'message' field")
            return False
        
        if 'id' not in data:
            print_result(False, "Response missing 'id' field")
            return False
        
        # Verify id is a string (UUID format)
        if not isinstance(data['id'], str):
            print_result(False, "ID is not a string")
            return False
        
        print(f"Contact ID: {data['id']}")
        print_result(True, "Contact form submission successful with valid data")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_contact_form_missing_fields():
    """Test POST /api/contact with missing required fields"""
    print_test_header("POST /api/contact - Missing Required Fields")
    
    try:
        payload = {
            "name": "x",
            "email": "y@z.com"
            # missing message field
        }
        response = requests.post(f"{BASE_URL}/contact", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Request payload: {json.dumps(payload)}")
        
        if response.status_code != 400:
            print_result(False, f"Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check for error field
        if 'error' not in data:
            print_result(False, "Response missing 'error' field")
            return False
        
        print(f"Error message: {data['error']}")
        print_result(True, "Contact form correctly rejects missing required fields with 400")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_paypal_create_order_valid():
    """Test POST /api/paypal/create-order with valid tier and qty"""
    print_test_header("POST /api/paypal/create-order - Valid Order (General Admission x2)")
    
    try:
        payload = {
            "tier": "General Admission",
            "qty": 2,
            "email": "fan@example.com",
            "eventId": "inaugural-show"
        }
        response = requests.post(f"{BASE_URL}/paypal/create-order", json=payload, timeout=15)
        print(f"Status Code: {response.status_code}")
        print(f"Request payload: {json.dumps(payload, indent=2)}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check for orderID field
        if 'orderID' not in data:
            print_result(False, "Response missing 'orderID' field")
            return False
        
        # Verify orderID is a non-empty string
        if not isinstance(data['orderID'], str) or len(data['orderID']) == 0:
            print_result(False, "orderID is not a non-empty string")
            return False
        
        print(f"PayPal Order ID: {data['orderID']}")
        
        # Verify MongoDB order document was created
        try:
            client = MongoClient(MONGO_URL)
            db = client[DB_NAME]
            order = db.orders.find_one({"paypalOrderId": data['orderID']})
            
            if not order:
                print_result(False, "Order not found in MongoDB")
                return False
            
            # Check order fields
            required_fields = ['id', 'paypalOrderId', 'tier', 'qty', 'amount', 'status']
            missing_fields = [f for f in required_fields if f not in order]
            if missing_fields:
                print_result(False, f"Order missing fields in MongoDB: {missing_fields}")
                return False
            
            # Verify no MongoDB _id in response (should only be in DB)
            if '_id' in data:
                print_result(False, "MongoDB _id exposed in API response")
                return False
            
            # Verify order details
            if order['tier'] != "General Admission":
                print_result(False, f"Expected tier 'General Admission', got '{order['tier']}'")
                return False
            
            if order['qty'] != 2:
                print_result(False, f"Expected qty 2, got {order['qty']}")
                return False
            
            if order['amount'] != 40:  # 20 * 2
                print_result(False, f"Expected amount 40, got {order['amount']}")
                return False
            
            if order['status'] != 'pending':
                print_result(False, f"Expected status 'pending', got '{order['status']}'")
                return False
            
            # Verify UUID format for id
            if not isinstance(order['id'], str) or len(order['id']) < 32:
                print_result(False, f"Order id is not a valid UUID: {order['id']}")
                return False
            
            print(f"MongoDB Order ID (UUID): {order['id']}")
            print(f"Order Amount: ${order['amount']}")
            print(f"Order Status: {order['status']}")
            
            client.close()
            
        except Exception as e:
            print_result(False, f"MongoDB verification failed: {str(e)}")
            return False
        
        print_result(True, "PayPal create-order successful with valid tier and MongoDB storage verified")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_paypal_create_order_all_tiers():
    """Test POST /api/paypal/create-order with all valid tiers and verify pricing"""
    print_test_header("POST /api/paypal/create-order - All Valid Tiers with Pricing")
    
    tiers = [
        {"tier": "General Admission", "qty": 2, "expected_amount": 40},  # 20 * 2
        {"tier": "First Row", "qty": 3, "expected_amount": 90},  # 30 * 3
        {"tier": "Kids", "qty": 5, "expected_amount": 50}  # 10 * 5
    ]
    
    all_passed = True
    
    for tier_test in tiers:
        try:
            payload = {
                "tier": tier_test["tier"],
                "qty": tier_test["qty"],
                "email": "pricing-test@example.com",
                "eventId": "inaugural-show"
            }
            response = requests.post(f"{BASE_URL}/paypal/create-order", json=payload, timeout=15)
            print(f"\nTesting {tier_test['tier']} x{tier_test['qty']}...")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code != 200:
                print_result(False, f"Expected 200 for {tier_test['tier']}, got {response.status_code}")
                all_passed = False
                continue
            
            data = response.json()
            
            if 'orderID' not in data:
                print_result(False, f"Missing orderID for {tier_test['tier']}")
                all_passed = False
                continue
            
            # Verify MongoDB pricing
            try:
                client = MongoClient(MONGO_URL)
                db = client[DB_NAME]
                order = db.orders.find_one({"paypalOrderId": data['orderID']})
                
                if not order:
                    print_result(False, f"Order not found in MongoDB for {tier_test['tier']}")
                    all_passed = False
                    client.close()
                    continue
                
                if order['amount'] != tier_test['expected_amount']:
                    print_result(False, f"Expected amount {tier_test['expected_amount']} for {tier_test['tier']}, got {order['amount']}")
                    all_passed = False
                    client.close()
                    continue
                
                print(f"✅ {tier_test['tier']} x{tier_test['qty']} = ${order['amount']} (correct)")
                client.close()
                
            except Exception as e:
                print_result(False, f"MongoDB verification failed for {tier_test['tier']}: {str(e)}")
                all_passed = False
                continue
                
        except Exception as e:
            print_result(False, f"Exception testing {tier_test['tier']}: {str(e)}")
            all_passed = False
            continue
    
    if all_passed:
        print_result(True, "All tiers tested successfully with correct server-side pricing")
    else:
        print_result(False, "Some tier pricing tests failed")
    
    return all_passed

def test_paypal_create_order_invalid_tier():
    """Test POST /api/paypal/create-order with invalid tier"""
    print_test_header("POST /api/paypal/create-order - Invalid Tier")
    
    try:
        payload = {
            "tier": "VIP Nonsense",
            "qty": 1,
            "email": "invalid@example.com",
            "eventId": "inaugural-show"
        }
        response = requests.post(f"{BASE_URL}/paypal/create-order", json=payload, timeout=15)
        print(f"Status Code: {response.status_code}")
        print(f"Request payload: {json.dumps(payload, indent=2)}")
        
        if response.status_code != 400:
            print_result(False, f"Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check for error field
        if 'error' not in data:
            print_result(False, "Response missing 'error' field")
            return False
        
        print(f"Error message: {data['error']}")
        print_result(True, "Invalid tier correctly rejected with 400")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_paypal_create_order_qty_clamping():
    """Test POST /api/paypal/create-order with qty out of range (clamping)"""
    print_test_header("POST /api/paypal/create-order - Qty Clamping (0 and 99)")
    
    test_cases = [
        {"qty": 0, "expected_clamped": 1, "expected_amount": 20},  # 0 -> 1, 20 * 1
        {"qty": 99, "expected_clamped": 20, "expected_amount": 400}  # 99 -> 20, 20 * 20
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        try:
            payload = {
                "tier": "General Admission",
                "qty": test_case["qty"],
                "email": "clamping-test@example.com",
                "eventId": "inaugural-show"
            }
            response = requests.post(f"{BASE_URL}/paypal/create-order", json=payload, timeout=15)
            print(f"\nTesting qty={test_case['qty']} (should clamp to {test_case['expected_clamped']})...")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code != 200:
                print_result(False, f"Expected 200 for qty={test_case['qty']}, got {response.status_code}")
                all_passed = False
                continue
            
            data = response.json()
            
            if 'orderID' not in data:
                print_result(False, f"Missing orderID for qty={test_case['qty']}")
                all_passed = False
                continue
            
            # Verify MongoDB qty and amount
            try:
                client = MongoClient(MONGO_URL)
                db = client[DB_NAME]
                order = db.orders.find_one({"paypalOrderId": data['orderID']})
                
                if not order:
                    print_result(False, f"Order not found in MongoDB for qty={test_case['qty']}")
                    all_passed = False
                    client.close()
                    continue
                
                if order['qty'] != test_case['expected_clamped']:
                    print_result(False, f"Expected clamped qty {test_case['expected_clamped']}, got {order['qty']}")
                    all_passed = False
                    client.close()
                    continue
                
                if order['amount'] != test_case['expected_amount']:
                    print_result(False, f"Expected amount {test_case['expected_amount']}, got {order['amount']}")
                    all_passed = False
                    client.close()
                    continue
                
                print(f"✅ qty={test_case['qty']} clamped to {order['qty']}, amount=${order['amount']} (correct)")
                client.close()
                
            except Exception as e:
                print_result(False, f"MongoDB verification failed for qty={test_case['qty']}: {str(e)}")
                all_passed = False
                continue
                
        except Exception as e:
            print_result(False, f"Exception testing qty={test_case['qty']}: {str(e)}")
            all_passed = False
            continue
    
    if all_passed:
        print_result(True, "Qty clamping working correctly (0->1, 99->20)")
    else:
        print_result(False, "Some qty clamping tests failed")
    
    return all_passed

def test_paypal_capture_order_missing_orderid():
    """Test POST /api/paypal/capture-order with missing orderID"""
    print_test_header("POST /api/paypal/capture-order - Missing orderID")
    
    try:
        payload = {}
        response = requests.post(f"{BASE_URL}/paypal/capture-order", json=payload, timeout=15)
        print(f"Status Code: {response.status_code}")
        print(f"Request payload: {json.dumps(payload)}")
        
        if response.status_code != 400:
            print_result(False, f"Expected 400, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check for error field
        if 'error' not in data:
            print_result(False, "Response missing 'error' field")
            return False
        
        # Check error message mentions orderID
        if 'orderid' not in data['error'].lower():
            print_result(False, "Error message doesn't mention orderID")
            return False
        
        print(f"Error message: {data['error']}")
        print_result(True, "Missing orderID correctly rejected with 400")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_paypal_capture_order_fake_orderid():
    """Test POST /api/paypal/capture-order with fake/unapproved orderID"""
    print_test_header("POST /api/paypal/capture-order - Fake/Unapproved orderID")
    
    try:
        payload = {"orderID": "FAKEORDER123"}
        response = requests.post(f"{BASE_URL}/paypal/capture-order", json=payload, timeout=15)
        print(f"Status Code: {response.status_code}")
        print(f"Request payload: {json.dumps(payload, indent=2)}")
        
        # Expect non-200 (likely 502) with error, NOT a server crash
        if response.status_code == 200:
            print_result(False, "Expected non-200 for fake orderID, got 200")
            print(f"Response: {response.text}")
            return False
        
        # Most likely 502 for PayPal API failure
        if response.status_code != 502:
            print(f"Note: Expected 502, got {response.status_code} (acceptable if it's an error response)")
        
        # Try to parse JSON response
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Check for error field
            if 'error' not in data:
                print_result(False, "Response missing 'error' field")
                return False
            
            print(f"Error message: {data['error']}")
        except:
            # If JSON parsing fails, just print the raw response
            print(f"Response (non-JSON): {response.text[:200]}")
            print("Note: Response is not JSON, but server returned error status (acceptable)")
        
        print_result(True, f"Fake orderID correctly rejected with {response.status_code} and error (no server crash)")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_regression_events():
    """Regression test: GET /api/events should return 6 events with inaugural-show first"""
    print_test_header("REGRESSION: GET /api/events - 6 Events with inaugural-show First")
    
    try:
        response = requests.get(f"{BASE_URL}/events", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Number of events: {len(data)}")
        
        if len(data) != 6:
            print_result(False, f"Expected 6 events, got {len(data)}")
            return False
        
        # Check first event is inaugural-show with status on-sale
        first_event = data[0]
        if first_event['id'] != 'inaugural-show':
            print_result(False, f"Expected first event id 'inaugural-show', got '{first_event['id']}'")
            return False
        
        if first_event['status'] != 'on-sale':
            print_result(False, f"Expected inaugural-show status 'on-sale', got '{first_event['status']}'")
            return False
        
        print(f"First event: {first_event['id']} (status: {first_event['status']})")
        print_result(True, "Events regression test passed: 6 events, inaugural-show first with on-sale status")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_regression_wrestlers():
    """Regression test: GET /api/wrestlers should return 8 wrestlers with specific ids"""
    print_test_header("REGRESSION: GET /api/wrestlers - 8 Wrestlers with Specific IDs")
    
    try:
        response = requests.get(f"{BASE_URL}/wrestlers", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Number of wrestlers: {len(data)}")
        
        if len(data) != 8:
            print_result(False, f"Expected 8 wrestlers, got {len(data)}")
            return False
        
        # Check for specific wrestler ids
        expected_ids = ['tj-slater', 'arik-walker', 'dangelo-leflame', 'alex-rey', 
                       'big-haus', 'draco', 'james-derek', 'rakzo-moreno']
        actual_ids = [w['id'] for w in data]
        
        missing_ids = [id for id in expected_ids if id not in actual_ids]
        if missing_ids:
            print_result(False, f"Missing wrestler ids: {missing_ids}")
            return False
        
        # Check all are category 'men' and champion false
        for wrestler in data:
            if wrestler['category'] != 'men':
                print_result(False, f"Expected category 'men' for {wrestler['id']}, got '{wrestler['category']}'")
                return False
            
            if wrestler['champion'] != False:
                print_result(False, f"Expected champion false for {wrestler['id']}, got {wrestler['champion']}")
                return False
        
        print(f"Wrestler IDs: {actual_ids}")
        print_result(True, "Wrestlers regression test passed: 8 wrestlers, all category 'men', champion false")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_regression_news():
    """Regression test: GET /api/news should return >=6 articles"""
    print_test_header("REGRESSION: GET /api/news - At Least 6 Articles")
    
    try:
        response = requests.get(f"{BASE_URL}/news", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_result(False, f"Expected 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Number of news articles: {len(data)}")
        
        if len(data) < 6:
            print_result(False, f"Expected at least 6 news articles, got {len(data)}")
            return False
        
        print_result(True, f"News regression test passed: {len(data)} articles (>=6)")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("BLACK AMETHYST WRESTLING - BACKEND API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Test started at: {datetime.now().isoformat()}")
    
    results = {}
    
    # Run all tests
    results['Events List'] = test_events_list()
    results['Event Detail'] = test_event_detail()
    results['Event Not Found'] = test_event_not_found()
    results['Wrestlers List'] = test_wrestlers_list()
    results['Wrestler Detail'] = test_wrestler_detail()
    results['Wrestler Not Found'] = test_wrestler_not_found()
    results['News List'] = test_news_list()
    results['Newsletter Signup (Valid)'] = test_newsletter_signup_success()
    results['Newsletter Signup (Invalid)'] = test_newsletter_signup_missing_email()
    results['Contact Form (Valid)'] = test_contact_form_success()
    results['Contact Form (Invalid)'] = test_contact_form_missing_fields()
    
    # PayPal tests
    print("\n" + "="*80)
    print("PAYPAL PAYMENT INTEGRATION TESTS")
    print("="*80)
    results['PayPal Create Order (Valid)'] = test_paypal_create_order_valid()
    results['PayPal Create Order (All Tiers)'] = test_paypal_create_order_all_tiers()
    results['PayPal Create Order (Invalid Tier)'] = test_paypal_create_order_invalid_tier()
    results['PayPal Create Order (Qty Clamping)'] = test_paypal_create_order_qty_clamping()
    results['PayPal Capture Order (Missing orderID)'] = test_paypal_capture_order_missing_orderid()
    results['PayPal Capture Order (Fake orderID)'] = test_paypal_capture_order_fake_orderid()
    
    # Regression tests
    print("\n" + "="*80)
    print("REGRESSION TESTS")
    print("="*80)
    results['Regression: Events'] = test_regression_events()
    results['Regression: Wrestlers'] = test_regression_wrestlers()
    results['Regression: News'] = test_regression_news()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    print(f"{'='*80}\n")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
