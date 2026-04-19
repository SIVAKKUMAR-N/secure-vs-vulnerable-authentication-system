# Authentication Vulnerability Demonstration (Secure vs Vulnerable)

## Overview

This project demonstrates common authentication vulnerabilities in web applications and how they can be mitigated using secure development practices.

It contains two implementations:

- **Vulnerable Authentication System** – intentionally insecure to demonstrate real-world flaws  
- **Secure Authentication System** – improved version with proper security controls  

The goal is to understand:
- How attackers exploit authentication weaknesses  
- How to design and implement secure authentication systems  

---

## Tech Stack

- Node.js  
- Express.js  
- MongoDB  

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
│
└── README.md
```

- **secure-auth** → Secure implementation of authentication  
- **vulnerable-auth** → Intentionally vulnerable version  
- **attack-scripts** → Scripts used to exploit vulnerabilities  

---

## Vulnerabilities Demonstrated

### 1. NoSQL Injection

**Description:**  
User input is directly used in MongoDB queries without validation, allowing injection of operators.

**Vulnerable Code:**
```js
User.findOne(req.body)
```

**Example Attack:**
```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":{"$ne":null}}'
```

**Impact:**  
This payload matches any user where `email != null`, allowing authentication bypass and login as the first user in the database.

---

### 2. Brute Force Attack (No Rate Limiting)

**Description:**  
Unlimited login attempts allow attackers to guess passwords.

**Demonstration:**  
A script repeatedly tries passwords from a wordlist.

**Example Output:**
```
Trying: 123456  
Trying: password  
Trying: admin123  
Password Found: admin123$
```

**Impact:**  
Attackers can discover valid passwords and take over accounts.

---

### 3. User Enumeration

**Description:**  
Different error messages reveal whether a user exists.

**Example:**
- "User not found"  
- "Invalid password"  

**Impact:**  
Attackers can identify valid user accounts and target them for further attacks.

---

### 4. Plaintext Password Storage

**Description:**  
Passwords are stored and compared directly.

**Vulnerable Code:**
```js
const isMatch = password === user.password;
```

**Impact:**  
If the database is compromised:
- All passwords are exposed  
- Password reuse can lead to further account compromise  

---

### 5. Weak JWT Implementation

**Description:**  
JWT tokens are generated without expiration.

**Vulnerable Code:**
```js
const accessToken = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.secret_key
);
```

**Impact:**  
Stolen tokens can be used indefinitely, leading to persistent unauthorized access.

---

## Attack Flow (Exploitation Process)

This project demonstrates how multiple vulnerabilities can be chained together:

```
User Enumeration
      ↓
Brute Force Attack
      ↓
NoSQL Injection
      ↓
JWT Token Abuse
      ↓
Full Account Compromise
```

### Step-by-step:

1. **User Enumeration**  
   Identify valid emails using different error messages  

2. **Brute Force Attack**  
   Attempt multiple passwords using a script  

3. **NoSQL Injection**  
   Bypass authentication using MongoDB operators  

4. **JWT Abuse**  
   Maintain persistent access using non-expiring tokens  

---

## Secure Implementation (Mitigations)

The secure version addresses these issues:

- Password hashing using **bcrypt**  
- Input validation and sanitization  
- MongoDB operator filtering  
- Rate limiting for login attempts  
- Generic error messages  
- JWT tokens with expiration  

---

### Code Comparison

#### ❌ Vulnerable
```js
User.findOne(req.body);
```

#### ✅ Secure
```js
User.findOne({ email: sanitizedEmail });
```

---

#### ❌ Vulnerable
```js
const isMatch = password === user.password;
```

#### ✅ Secure
```js
const isMatch = await bcrypt.compare(password, user.password);
```

---

## How to Run

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Run vulnerable app
node vulnerable-auth/app.js

# Run secure app
node secure-auth/app.js
```

---

## Attack Scripts Usage

- `bruteforce_attack/` → password guessing using wordlist  
- `nosql-injection.sh` → performs NoSQL injection  
- `user-enum.sh` → identifies valid users  

---

## Key Learning

- Authentication vulnerabilities can be chained together  
- Small security flaws can lead to full system compromise  
- Secure design requires:
  - Proper validation  
  - Strong authentication logic  
  - Secure session handling  

---

## Note

This project is created for educational purposes only.  
It demonstrates vulnerabilities and their mitigations and should **not be used in production**.
