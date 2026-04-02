const mongoose = require('mongoose'); // Import the Mongoose library to define schemas and interact with MongoDB.

// Define the User schema using Mongoose, which will represent the structure of user documents in the MongoDB database.
const UserSchema = new mongoose.Schema(  // for Schema the S shold be capital
    {
        name: {
            type: String,
            required: true
        },
        email: {
        type: String,
        required: true,
        unique: true, // Ensure email uniqueness
        lowercase: true,  //  Normalize email to lowercase
        trim: true //  Remove whitespace from both ends
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String, //S for string
            enum: ['user' , 'teamlead' , 'admin'], // Restrict role to specific values
            default: 'user'
        },
    },
        {
        // ✅ timestamps: true automatically adds:
        // - createdAt → when document is created
        // - updatedAt → when document is updated
        // 💡 Helpful for logs, sorting, filtering, tracking changes
            timestamps: true
        }
);

const User = mongoose.model('User',UserSchema); // here the User becomes 'Users' in the collection name of MongoDB, and user_details is the model we will use in our code to interact with that collection.

module.exports = User; // Export the User model so it can be imported and used in other parts of the application, such as in route handlers or controllers.
