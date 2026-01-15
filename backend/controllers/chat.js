const axios = require('axios');

const chatWithBot = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for Peerly, a skill marketplace for students. Help users understand the platform, find gigs, or navigate the site. Keep responses concise and friendly.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });

  } catch (error) {
    console.error('Groq API Error:', error.response ? error.response.data : error.message);

    if (error.response && error.response.status === 429) {
      return res.status(429).json({ message: 'Daily limit reached. Please try again later.' });
    }

    res.status(500).json({ message: 'Failed to communicate with chatbot service.' });
  }
};

module.exports = {
  chatWithBot,
};
