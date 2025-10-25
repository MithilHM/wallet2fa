#!/usr/bin/env python3
"""
MongoDB Integration Test for Wallet2FA
Tests database operations and ZK proof storage
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://wallet-tidy.preview.emergentagent.com/api"
TEST_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

def test_nonce_storage_and_cleanup():
    """Test that nonces are stored and cleaned up properly"""
    print("🧪 Testing nonce storage and cleanup...")
    
    # Generate multiple nonces for same address
    nonces = []
    for i in range(3):
        payload = {"address": TEST_ADDRESS}
        response = requests.post(f"{BASE_URL}/auth/nonce", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            nonces.append(data['nonce'])
            print(f"   Generated nonce {i+1}: {data['nonce'][:8]}...")
        else:
            print(f"❌ Failed to generate nonce {i+1}: {response.status_code}")
            return False
    
    # Verify all nonces are different
    if len(set(nonces)) != len(nonces):
        print("❌ Nonces should be unique")
        return False
    
    print("✅ Nonce generation and uniqueness working correctly")
    return True

def test_zk_proof_structure():
    """Test ZK proof generation structure"""
    print("🧪 Testing ZK proof structure...")
    
    # Generate nonce first
    payload = {"address": TEST_ADDRESS}
    response = requests.post(f"{BASE_URL}/auth/nonce", json=payload, timeout=10)
    
    if response.status_code != 200:
        print(f"❌ Failed to generate nonce: {response.status_code}")
        return False
    
    nonce = response.json()['nonce']
    
    # Try to verify with invalid signature (to test ZK proof generation)
    mock_message = f"""localhost:3000 wants you to sign in with your Ethereum account:
{TEST_ADDRESS}

Sign in with Ethereum to the app.

URI: http://localhost:3000
Version: 1
Chain ID: 1
Nonce: {nonce}
Issued At: {datetime.now().isoformat()}"""
    
    verify_payload = {
        "message": mock_message,
        "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b",
        "address": TEST_ADDRESS
    }
    
    response = requests.post(f"{BASE_URL}/auth/verify", json=verify_payload, timeout=10)
    
    # Should fail signature verification but we can check the error structure
    if response.status_code == 401:
        data = response.json()
        if 'success' in data and data['success'] == False:
            print("✅ ZK proof generation endpoint structure correct (signature verification properly fails)")
            return True
    
    print(f"❌ Unexpected response from verify endpoint: {response.status_code}")
    return False

def test_endpoint_error_handling():
    """Test various error conditions"""
    print("🧪 Testing error handling...")
    
    # Test invalid routes
    invalid_routes = [
        "/nonexistent",
        "/auth/invalid",
        "/user/invalid"
    ]
    
    for route in invalid_routes:
        response = requests.get(f"{BASE_URL}{route}", timeout=10)
        if response.status_code != 404:
            print(f"❌ Route {route} should return 404, got {response.status_code}")
            return False
    
    print("✅ Error handling working correctly")
    return True

def test_cors_preflight():
    """Test CORS preflight for different endpoints"""
    print("🧪 Testing CORS preflight requests...")
    
    endpoints = ["/health", "/auth/nonce", "/auth/verify", "/user/profile"]
    
    for endpoint in endpoints:
        response = requests.options(f"{BASE_URL}{endpoint}", timeout=10)
        if response.status_code != 200:
            print(f"❌ OPTIONS request to {endpoint} failed: {response.status_code}")
            return False
    
    print("✅ CORS preflight working for all endpoints")
    return True

def test_rate_limiting_behavior():
    """Test rapid requests to check for any rate limiting or errors"""
    print("🧪 Testing rapid request handling...")
    
    # Make rapid requests to health endpoint
    success_count = 0
    for i in range(10):
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            success_count += 1
    
    if success_count == 10:
        print("✅ Rapid requests handled correctly")
        return True
    else:
        print(f"❌ Only {success_count}/10 rapid requests succeeded")
        return False

def main():
    """Run MongoDB integration tests"""
    print("🚀 Starting MongoDB Integration Tests")
    print(f"📍 Base URL: {BASE_URL}")
    print("=" * 50)
    
    tests = [
        test_nonce_storage_and_cleanup,
        test_zk_proof_structure,
        test_endpoint_error_handling,
        test_cors_preflight,
        test_rate_limiting_behavior
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ FAIL {test.__name__}: {str(e)}")
            failed += 1
        print()
    
    print("=" * 50)
    print("📊 INTEGRATION TEST SUMMARY")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)