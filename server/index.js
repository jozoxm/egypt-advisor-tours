const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route for root
app.get('/', (req, res) => {
    res.send('Welcome to the Egypt Advisor Tours API!');
});

// Sample route for tours
app.get('/tours', (req, res) => {
    res.json([
        { id: 1, name: 'Pyramids of Giza' },
        { id: 2, name: 'Luxor Temple' },
        { id: 3, name: 'Valley of the Kings' }
    ]);
});

// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
