#!/usr/bin/env python3
"""
Wallet2FA Backend API Testing Suite
Tests all backend endpoints for the Wallet2FA authentication system
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://wallet-tidy.preview.emergentagent.com/api"
TEST_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
TEST_ADDRESS_2 = "0x1234567890123456789012345678901234567890"

class Wallet2FABackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.jwt_token = None
        self.test_nonce = None
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_endpoint(self):
        """Test GET /api/health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ['status', 'timestamp', 'service']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Health Endpoint", False, 
                                  f"Missing required fields: {missing_fields}", data)
                    return False
                
                # Check field values
                if data['status'] != 'ok':
                    self.log_result("Health Endpoint", False, 
                                  f"Expected status 'ok', got '{data['status']}'", data)
                    return False
                
                if 'Wallet2FA' not in data['service']:
                    self.log_result("Health Endpoint", False, 
                                  f"Expected service to contain 'Wallet2FA', got '{data['service']}'", data)
                    return False
                
                self.log_result("Health Endpoint", True, 
                              "Health endpoint working correctly", data)
                return True
            else:
                self.log_result("Health Endpoint", False, 
                              f"Expected status 200, got {response.status_code}", 
                              response.text)
                return False
                
        except Exception as e:
            self.log_result("Health Endpoint", False, f"Request failed: {str(e)}")
            return False
    
    def test_root_endpoint(self):
        """Test GET /api/ endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ['message', 'version', 'endpoints']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Root Endpoint", False, 
                                  f"Missing required fields: {missing_fields}", data)
                    return False
                
                # Check endpoints list
                expected_endpoints = [
                    'POST /api/auth/nonce',
                    'POST /api/auth/verify', 
                    'GET /api/user/profile',
                    'GET /api/health'
                ]
                
                for endpoint in expected_endpoints:
                    if endpoint not in data['endpoints']:
                        self.log_result("Root Endpoint", False, 
                                      f"Missing endpoint: {endpoint}", data)
                        return False
                
                self.log_result("Root Endpoint", True, 
                              "Root endpoint working correctly", data)
                return True
            else:
                self.log_result("Root Endpoint", False, 
                              f"Expected status 200, got {response.status_code}", 
                              response.text)
                return False
                
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Request failed: {str(e)}")
            return False
    
    def test_nonce_endpoint(self):
        """Test POST /api/auth/nonce endpoint"""
        try:
            # Test with valid address
            payload = {"address": TEST_ADDRESS}
            response = requests.post(f"{self.base_url}/auth/nonce", 
                                   json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'nonce' not in data:
                    self.log_result("Nonce Endpoint", False, 
                                  "Response missing 'nonce' field", data)
                    return False
                
                nonce = data['nonce']
                
                # Check nonce format (should be 32 character hex string)
                if not isinstance(nonce, str) or len(nonce) != 32:
                    self.log_result("Nonce Endpoint", False, 
                                  f"Expected 32-char hex nonce, got: {nonce}", data)
                    return False
                
                # Check if nonce is valid hex
                try:
                    int(nonce, 16)
                except ValueError:
                    self.log_result("Nonce Endpoint", False, 
                                  f"Nonce is not valid hex: {nonce}", data)
                    return False
                
                self.test_nonce = nonce  # Store for later use
                self.log_result("Nonce Endpoint", True, 
                              f"Nonce generated successfully: {nonce[:8]}...", data)
                
                # Test with missing address
                response = requests.post(f"{self.base_url}/auth/nonce", 
                                       json={}, timeout=10)
                if response.status_code != 400:
                    self.log_result("Nonce Endpoint Validation", False, 
                                  f"Expected 400 for missing address, got {response.status_code}")
                    return False
                
                self.log_result("Nonce Endpoint Validation", True, 
                              "Correctly rejects missing address")
                return True
            else:
                self.log_result("Nonce Endpoint", False, 
                              f"Expected status 200, got {response.status_code}", 
                              response.text)
                return False
                
        except Exception as e:
            self.log_result("Nonce Endpoint", False, f"Request failed: {str(e)}")
            return False
    
    def test_verify_endpoint_invalid(self):
        """Test POST /api/auth/verify endpoint with invalid data"""
        try:
            # Test with missing fields
            test_cases = [
                ({}, "empty payload"),
                ({"message": "test"}, "missing signature and address"),
                ({"signature": "test"}, "missing message and address"),
                ({"address": TEST_ADDRESS}, "missing message and signature"),
                ({"message": "test", "signature": "test"}, "missing address"),
                ({"message": "test", "address": TEST_ADDRESS}, "missing signature"),
                ({"signature": "test", "address": TEST_ADDRESS}, "missing message")
            ]
            
            for payload, description in test_cases:
                response = requests.post(f"{self.base_url}/auth/verify", 
                                       json=payload, timeout=10)
                
                if response.status_code != 400:
                    self.log_result("Verify Endpoint Validation", False, 
                                  f"Expected 400 for {description}, got {response.status_code}")
                    return False
            
            self.log_result("Verify Endpoint Validation", True, 
                          "Correctly validates required fields")
            return True
            
        except Exception as e:
            self.log_result("Verify Endpoint Validation", False, f"Request failed: {str(e)}")
            return False
    
    def test_verify_endpoint_with_invalid_signature(self):
        """Test POST /api/auth/verify with invalid SIWE signature"""
        try:
            # Create a mock SIWE message (this will fail signature verification)
            mock_message = f"""localhost:3000 wants you to sign in with your Ethereum account:
{TEST_ADDRESS}

Sign in with Ethereum to the app.

URI: http://localhost:3000
Version: 1
Chain ID: 1
Nonce: {self.test_nonce or 'abcd1234abcd1234abcd1234abcd1234'}
Issued At: {datetime.now().isoformat()}"""
            
            payload = {
                "message": mock_message,
                "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b",
                "address": TEST_ADDRESS
            }
            
            response = requests.post(f"{self.base_url}/auth/verify", 
                                   json=payload, timeout=10)
            
            # Should return 401 for invalid signature
            if response.status_code == 401:
                data = response.json()
                if data.get('success') == False:
                    self.log_result("Verify Endpoint Invalid Signature", True, 
                                  "Correctly rejects invalid signature", data)
                    return True
                else:
                    self.log_result("Verify Endpoint Invalid Signature", False, 
                                  "Should return success: false for invalid signature", data)
                    return False
            else:
                self.log_result("Verify Endpoint Invalid Signature", False, 
                              f"Expected status 401, got {response.status_code}", 
                              response.text)
                return False
                
        except Exception as e:
            self.log_result("Verify Endpoint Invalid Signature", False, f"Request failed: {str(e)}")
            return False
    
    def test_profile_endpoint_unauthorized(self):
        """Test GET /api/user/profile without authorization"""
        try:
            # Test without Authorization header
            response = requests.get(f"{self.base_url}/user/profile", timeout=10)
            
            if response.status_code == 401:
                data = response.json()
                if 'error' in data and 'Unauthorized' in data['error']:
                    self.log_result("Profile Endpoint Unauthorized", True, 
                                  "Correctly rejects unauthorized access", data)
                else:
                    self.log_result("Profile Endpoint Unauthorized", False, 
                                  "Should return 'Unauthorized' error", data)
                    return False
            else:
                self.log_result("Profile Endpoint Unauthorized", False, 
                              f"Expected status 401, got {response.status_code}", 
                              response.text)
                return False
            
            # Test with invalid token
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.get(f"{self.base_url}/user/profile", 
                                  headers=headers, timeout=10)
            
            if response.status_code == 401:
                self.log_result("Profile Endpoint Invalid Token", True, 
                              "Correctly rejects invalid token")
                return True
            else:
                self.log_result("Profile Endpoint Invalid Token", False, 
                              f"Expected status 401 for invalid token, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Profile Endpoint Unauthorized", False, f"Request failed: {str(e)}")
            return False
    
    def test_mongodb_connection(self):
        """Test MongoDB connection by checking if endpoints work"""
        try:
            # The nonce endpoint uses MongoDB connection
            payload = {"address": TEST_ADDRESS_2}
            response = requests.post(f"{self.base_url}/auth/nonce", 
                                   json=payload, timeout=10)
            
            if response.status_code == 200:
                self.log_result("MongoDB Connection", True, 
                              "MongoDB connection working (nonce endpoint successful)")
                return True
            else:
                self.log_result("MongoDB Connection", False, 
                              f"MongoDB connection may be failing, nonce endpoint returned {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("MongoDB Connection", False, f"MongoDB connection test failed: {str(e)}")
            return False
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            missing_headers = []
            for header in cors_headers:
                if header not in response.headers:
                    missing_headers.append(header)
            
            if missing_headers:
                self.log_result("CORS Headers", False, 
                              f"Missing CORS headers: {missing_headers}")
                return False
            else:
                self.log_result("CORS Headers", True, 
                              "All required CORS headers present")
                return True
                
        except Exception as e:
            self.log_result("CORS Headers", False, f"CORS test failed: {str(e)}")
            return False
    
    def test_options_method(self):
        """Test OPTIONS method for CORS preflight"""
        try:
            response = requests.options(f"{self.base_url}/health", timeout=10)
            
            if response.status_code == 200:
                self.log_result("OPTIONS Method", True, 
                              "OPTIONS method working for CORS preflight")
                return True
            else:
                self.log_result("OPTIONS Method", False, 
                              f"Expected status 200 for OPTIONS, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("OPTIONS Method", False, f"OPTIONS test failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Wallet2FA Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Run tests in order
        tests = [
            self.test_health_endpoint,
            self.test_root_endpoint,
            self.test_nonce_endpoint,
            self.test_verify_endpoint_invalid,
            self.test_verify_endpoint_with_invalid_signature,
            self.test_profile_endpoint_unauthorized,
            self.test_mongodb_connection,
            self.test_cors_headers,
            self.test_options_method
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
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
                failed += 1
            
            print()  # Add spacing between tests
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("🎉 All backend tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            return False

def main():
    """Main test runner"""
    tester = Wallet2FABackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()