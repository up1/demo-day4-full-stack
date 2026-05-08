# API :: Login

## 1. API Endpoint
- **Endpoint**: POST /api/login
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
  - **Success**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here"
  }
  ```
  - **Failure**:
  ```json
  { 
    "message": "Invalid email or password" 
  }
  ```

## 2. Input validation
* Use FluentValidation for validating the input fields in the API request.

| Field Name | Validation Rule | Error Message |
|------------|-----------------|---------------|
| Email      | Must be a valid email format | "Please enter a valid email address." |
| Password   | Must be at least 8 characters long | "Password must be at least 8 characters." |

## 3. Business Logic/Flow
1. The API receives a POST request at the /api/login endpoint with the user's email and password.
2. The API validates the input fields using FluentValidation.
3. If validation fails, the API responds with appropriate error messages.
4. If validation succeeds, the API checks the credentials against the database.
5. If the credentials are valid, the API generates a JWT token and responds with a success message and the token.
6. If the credentials are invalid, the API responds with an error message indicating the reason for failure.   

## 4. Test Cases
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC001 | Valid login | 1. Send a POST request with valid email and password. | API responds with a success message and a JWT token. |
| TC002 | Invalid email format | 1. Send a POST request with an invalid email format (e.g., "userexample.com"). | API responds with an error message "Please enter a valid email address." |
| TC003 | Short password | 1. Send a POST request with a valid email and a password shorter than 8 characters (e.g., "pass"). | API responds with an error message "Password must be at least 8 characters." |
| TC004 | Incorrect credentials | 1. Send a POST request with a valid email and an incorrect password. | API responds with an error message "Invalid email or password". |  
