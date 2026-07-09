#!/usr/bin/env python3
"""
Backend API Test Suite for Black Amethyst Wrestling
Tests all API endpoints with validation
"""

import requests
import json
from datetime import datetime

# Base URL from environment
BASE_URL = "https://baw-elite.preview.emergentagent.com/api"

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
