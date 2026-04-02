#!/bin/bash

URL="http://127.0.0.1:5000/api/auth/login"
EMAIL="test6@gmail.com"
PASS_FILE="passwords.txt"

echo "[*] Starting test against $URL"

while read -r password; do
    # Skip empty lines
    [[ -z "$password" ]] && continue

    # Send request and capture status code
JSON_DATA=$(printf '{"email":"%s","password":"%s"}' "$EMAIL" "$password")

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "$JSON_DATA")

    if [[ "$STATUS" == "200" ]]; then
        echo -e "\n[+] SUCCESS! Password found: $password"
        rm "$PASS_FILE" # Cleanup
        exit 0
    elif [[ "$STATUS" == "000" ]]; then
        echo -e "\n[!] Connection Error! curl cannot reach the server."
        exit 1
    else
        # \r here just keeps the terminal output on one line for progress
        echo -ne "[*] Trying: $password (Status: $STATUS)      \r"
    fi

done < "$PASS_FILE"

echo -e "\n[-] Test complete. No valid password found."
rm "$PASS_FILE"