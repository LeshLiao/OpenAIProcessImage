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
                    role: "system",
                    content: ""
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `${userPrompt}`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `${imageUrl}`
                            }
                        }
                    ]
                }
            ],
        });

        let content = gptResponse.choices[0]?.message?.content || "";

        // Remove markdown code block formatting if present
        const cleaned = content
            .replace(/^```json\s*/, '')
            .replace(/^```/, '')
            .replace(/\n```$/, '')
            .trim();

        let jsonResponse;

        try {
            jsonResponse = JSON.parse(cleaned);
        } catch (parseError) {
            // Not valid JSON — return as string
            jsonResponse = content;
        }

        res.json({
            message: 'Image processed',
            response: jsonResponse
        });

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image' });
    }


});


app.post('/process-image-prompt01', async (req, res) => {
    const { data } = req.body; // Extract "data" object

    if (!data || !data.image || typeof data.image !== 'string') {
        return res.status(400).json({ error: 'Valid image URL is required in "data.image"' });
    }

    const imageUrl = data.image;
    // const userPrompt = data.prompt || '';
    const userPrompt = 'Extract the chinese word on the menu, please response as a json format, for example: {\"entree\": [{\"price\": 50,\"name\": \"香菇肉燥飯\"},{\"price\": 55,\"name\": \"肉燥乾麵\"}]}';

    console.log(`Received userPrompt: ${userPrompt}`);
    console.log(`Received Image URL: ${imageUrl}`);

    try {
        const gptResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: "system",
                    content: ""
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `${userPrompt}`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `${imageUrl}`
                            }
                        }
                    ]
                }
            ],
        });

        let content = gptResponse.choices[0]?.message?.content || "";

        // Remove markdown code block formatting if present
        const cleaned = content
            .replace(/^```json\s*/, '')
            .replace(/^```/, '')
            .replace(/\n```$/, '')
            .trim();

        let jsonResponse;

        try {
            jsonResponse = JSON.parse(cleaned);
        } catch (parseError) {
            // Not valid JSON — return as string
            jsonResponse = content;
        }

        res.json({
            message: 'Image processed',
            response: jsonResponse
        });

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image' });
    }


});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
