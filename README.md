# Authentication Vulnerabilty Demonstration

## project overview

This project demonstates the common vulnerabilities in the authentication system and also shows secure implementations to prevent them.

Tech stack: node.js, express.js, MongoDB.

## project architecture

project-root
│
├── secure-auth
├── vulnerable-auth
├── attack-scripts
│   ├── bruteforce_attack
│   │   ├──brute-force.sh
│   │   └──passwords.txt
│   ├── nosql-injection.sh
│   └── user-enum.sh
│
└── README.md

secure-auth - secure-auth is a highly secured authentication system.

vulnerable-auth - vulnerable auth is vulnerable system that demonstrates common authentication vulnerabilities.

attackscripts - attackscripts contain scripts that needed to exploit some vulnerabilities in vulnerable-auth.

## Vulnerabilities Demonstrated

### NoSQL Injection

Description:
            
NoSQL Injection is a database attack where an attacker can manipulate the database query using special operators.

vulnerable code:
```node            
const existingUser = await User.findOne({ email });
```
Here the application directly uses user input inside the database query without validation. This allows attackers to inject MongoDB operators such as $ne, $gt or $regex.

example attack:
```node 
curl -X POST http://127.0.0.1:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":{"$ne":null}}'
```
Impact:
Therefore the payload '{"email":{"$ne":null}}'matches any user whose email is not null, so the database returns the first user of the database.

### Brute force Attack (No Rate Limiting)

Description:

The vulnerable application allows multiple login attempts without any restriction. so attacker can guess the password using bruteforce scripts.

Demonstration:

A bruteforce script is created using curl to repeatedly try different password from password list to find the correct password.

Example output:

Trying: 123456 
Trying: password 
Trying: admin123 
password: admin123$

Impact: Attacker can find the password of a specific email by multiple login attempts using multiple passwords from wordlist.

### User Enumeration

Description:

The vulnerable application gives different responses for invalid email and invalid password so the attacker can find a legitimate email that means a valid user.

Demonstration:

A script sends a login request to the login page with different emails to find the valid user.

Impact:

Attacker can find the valid user emails in the system.

### Plaintext Password Storage

Description:

Passwords are stored and compared directly in plaintext.

vulnerable code:
```node 
const isMatch = password === user.password;
```
Impact:

If the database is compromised, attackers gain immediate access to all user passwords.
Users often reuse passwords, which can lead to further account compromises.

Secure Practice:

Passwords should always be hashed using a secure algorithm such as *bcrypt*.

### Weak JWT Practice

Description:

JWT access tokens are created with no expiration time 

vulnerable code:
```node 
const accesstoken = jwt.sign({userId : user._id,  role: user.role},process.env.secret_key);
```
Impact:

if an attacker somehow got a jwt token he can access the app indefinitely

Secure Practice:

JWT access token is always created with small expiry time

## Secure Version (Mitigations)

 -Password hashing using bcrypt
 -Input validation for anything that is provided by user
 -Sanitizing MongoDB operators
 -Rate limiting helps to prevent brute-force
 -Generic error messages like "Invalid credentials for invalid logins"

 ## Attack Flow (Exploitation Process)

This section shows how an attacker can exploit multiple vulnerabilities in sequence.

### Step 1 – User Enumeration
The attacker first identifies valid user emails by observing different login responses such as **"User not found"** and **"Invalid credentials"**.

### Step 2 – Brute Force Attack
Once a valid email is discovered, the attacker runs a brute-force script using a password wordlist to attempt multiple passwords.

### Step 3 – NoSQL Injection
Instead of guessing the password, the attacker can inject MongoDB operators into the login request to bypass authentication.

Example payload:
```node
curl -X POST http://127.0.0.1:5000/api/auth/login 
-H "Content-Type: application/json" 
-d '{"email":{"$ne":null}}'
```

### Step 4 – Access Token Abuse
After authentication, a JWT token is generated without expiration.
If an attacker obtains this token, they can access the system indefinitely.

This demonstrates how multiple small vulnerabilities can combine to create a serious security risk.


## Educational Purpose

This project was created to demonstrate how authentication vulnerabilities occur and how attackers exploit them.
It should never be deployed in production.