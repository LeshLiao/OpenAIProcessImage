const express = require('express');
const axios = require('axios');
const base64Img = require('base64-img');  // Ensure base64-img is installed
const { OpenAI } = require('openai'); // Updated import
require('dotenv').config();  // Add this line to load environment variables

const app = express();

// Middleware to parse JSON request body
app.use(express.json());

// Initialize OpenAI API Client using the API key from the environment variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Get API key from environment variable
});

// API to accept an image URL inside a "data" object
app.post('/process-image', async (req, res) => {
    const { data } = req.body; // Extract "data" object

    if (!data || !data.image || typeof data.image !== 'string') {
        return res.status(400).json({ error: 'Valid image URL is required in "data.image"' });
    }

    const imageUrl = data.image;
    const userPrompt = data.prompt || ''; 

    console.log(`Received userPrompt: ${userPrompt}`);
    console.log(`Received Image URL: ${imageUrl}`);

    try {
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    "role": "system",
                    "content": ""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": `${userPrompt}`
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": `${imageUrl}`
                            }
                        }
                    ]
                }
            ],
        });

        const response = gptResponse.choices[0]?.message?.content;

        res.json({ message: 'Image processed', response: response });

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
