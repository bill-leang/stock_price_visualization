const express = require('express');
const cors = require('cors');
const path = require('path');

//Create an Express app
const app = express();

//enable CORS for all routes
app.use(cors());

app.use(express.static(path.join(__dirname)));

// app.get('/', (req, res) => {
//     res.send('Hello, world!');
// });



app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
