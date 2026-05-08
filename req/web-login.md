# Feature : login

## 1. User flow
1. User fill in email and password in the login form.
2. User clicks the "Login" button.
3. The system validates the input fields.
4. If validation fails, the system displays appropriate error messages.
5. If validation succeeds, the system sends a login request to the server.
6. The server processes the login request and responds with success or failure.
7. If login is successful, the user is redirected to the dashboard.
8. If login fails, the system displays an error message indicating the reason for failure.


## 2. Input validation in table format
| Field Name | Validation Rule | Error Message |
|------------|-----------------|---------------|
| Email      | Must be a valid email format | "Please enter a valid email address." |
| Password   | Must be at least 8 characters long | "Password must be at least 8 characters." |

## 3. Test Cases
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC001 | Valid login | 1. Enter valid email and password. 2. Click "Login". | User is redirected to the dashboard. |
| TC002 | Invalid email format | 1. Enter an invalid email format (e.g., "userexample.com"). 2. Click "Login". | Error message "Please enter a valid email address." is displayed. |    
| TC003 | Short password | 1. Enter a valid email and a password shorter than 8 characters (e.g., "pass"). 2. Click "Login". | Error message "Password must be at least 8 characters." is displayed. |
| TC004 | Incorrect credentials | 1. Enter a valid email and an incorrect password. 2. Click "Login". | Error message "Invalid email or password" is displayed. |

## 4. API Endpoint
- Call API with HttpClient module in Angular to handle the login request.
  * timeout: 5000ms
  * retry: 2 times with a delay of 1000ms between retries
  
- **Endpoint**: POST /api/login
* use spec from `req/api-login.md` for API request and response details.
