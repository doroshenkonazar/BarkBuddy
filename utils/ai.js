// AI utility functions for BarkBuddy

// Function to get AI response using OpenAI API
export async function getAIResponse(prompt, apiKey) {
  if (!apiKey) {
    throw new Error("API key not provided")
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Failed to get AI response")
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("AI API error:", error)
    throw error
  }
}

// Function to analyze page content
export async function analyzePageContent(content, apiKey) {
  if (!content || content.trim() === "") {
    return "No content to analyze"
  }

  // Truncate content if too long
  const truncatedContent = content.length > 3000 ? content.slice(0, 3000) + "..." : content

  try {
    return await getAIResponse(
      `Analyze this webpage content and provide key points (max 3 bullet points):
      ${truncatedContent}`,
      apiKey,
    )
  } catch (error) {
    console.error("Content analysis error:", error)
    throw error
  }
}

// Function to generate a helpful tip based on page content
export async function generateHelpfulTip(content, apiKey) {
  if (!content || content.trim() === "") {
    return "I can help you navigate this page!"
  }

  // Truncate content if too long
  const truncatedContent = content.length > 2000 ? content.slice(0, 2000) + "..." : content

  try {
    return await getAIResponse(
      `Based on this webpage content, provide ONE short, helpful tip as a friendly dog assistant:
      ${truncatedContent}`,
      apiKey,
    )
  } catch (error) {
    console.error("Tip generation error:", error)
    return "Woof! I can help you navigate this page!"
  }
}
