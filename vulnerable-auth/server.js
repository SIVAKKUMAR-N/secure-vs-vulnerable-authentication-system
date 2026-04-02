require('dotenv').config(); // Load environment variables from .env file into process.env, allowing us to access them in our code using process.env.VARIABLE_NAME.
const app = require('./src/app.js');   // Import the Express application instance from src/app.js, which contains our middleware and route definitions.
const connectDB = require('./src/config/db.js'); // Import the function to connect to the MongoDB database from src/config/db.js, which will establish a connection when called.
// Connect to MongoDB database
connectDB();

app.get( '/', (req , res) => {
  res.send('app running');
});

const PORT=process.env.PORT || 5000; // Use PORT from .env or default to 5000
app.listen(PORT ,"0.0.0.0", () =>{  //0.0.0.0 is used to allow connections from any IP address, which is useful when running the server in a containerized environment or when you want to allow access from other machines on the network.
    console.log(`server running on port ${PORT}`);
});
