# Authentication Vulnerability Demonstration (Secure vs Vulnerable)

## Overview

This project demonstrates how common authentication vulnerabilities occur in web applications and how they can be fixed using secure practices.

It contains two versions of the same system:

* A **vulnerable authentication system** that exposes real-world flaws
* A **secure implementation** that fixes those issues

The goal is to understand both:

* How attackers exploit weaknesses
* How to properly secure authentication systems

---

## Tech Stack

* Node.js
* Express.js
* MongoDB

---

## Project Structure

```
project-root
│
├── secure-auth
├── vulnerable-auth
├── attack-scripts
│   ├── bruteforce_attack
│   │   ├── brute-force.sh
│   │   └── passwords.txt
│   ├── nosql-injection.sh
│   └── user-enum.sh
└── README.md
```

---

## Vulnerabilities Demonstrated

### 1. NoSQL Injection

**Description:**
User input is directly used in MongoDB queries without validation.

**Vulnerable Code:**

```js
User.findOne(req.body)
```

**Exploitation:**

```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":{"$ne":null}}'
```

**Impact:**
This payload matches any user where `email != null`, allowing authentication bypass and unauthorized access.

---

### 2. Brute Force Attack (No Rate Limiting)

**Description:**
The application allows unlimited login attempts.

**Exploitation:**
A script repeatedly tries passwords from a wordlist using curl.

**Impact:**
Enables account takeover by guessing passwords through automated attempts.

---

### 3. User Enumeration

**Description:**
Different error messages are returned for:

* Invalid email
* Invalid password

**Impact:**
Attackers can identify valid user accounts, which makes further attacks easier.

---

### 4. Plaintext Password Storage

**Description:**
Passwords are stored and compared directly.

**Vulnerable Code:**

```js
const isMatch = password === user.password;
```

**Impact:**
If the database is compromised, all user passwords are exposed immediately.

---

### 5. Weak JWT Implementation

**Description:**
JWT tokens are generated without expiration.

**Vulnerable Code:**

```js
jwt.sign({ userId: user._id, role: user.role }, process.env.secret_key);
```

**Impact:**
Stolen tokens can be used indefinitely, leading to persistent unauthorized access.

---

## Attack Chain (Realistic Scenario)

This project shows how multiple small issues can combine into a serious attack:

1. **User Enumeration**
   Identify valid user emails

2. **Brute Force Attack**
   Guess passwords using automation

3. **NoSQL Injection**
   Bypass authentication completely

4. **JWT Abuse**
   Maintain long-term access without expiration

**Result:**
Full account compromise and persistent access.

---

## Secure Implementation

The secure version fixes the above issues using:

* Password hashing with bcrypt
* Input validation and sanitization
* Rate limiting for login attempts
* Generic error messages
* JWT tokens with expiration

---

## Key Learning

* Authentication vulnerabilities are often chained together
* Small mistakes can lead to full system compromise
* Secure design requires proper validation, access control, and session handling

---

## Note

This project is created for educational purposes only.
It demonstrates how vulnerabilities work and how they should be fixed.
It should not be used in production.
