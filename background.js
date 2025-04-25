// Import configuration
import { OPENAI_API_KEY } from "./config.js"

// Check if chrome is defined, if not, define it (for testing environments)
if (typeof chrome === "undefined") {
  global.chrome = {
    runtime: {
      onInstalled: { addListener: () => {} },
      onMessage: { addListener: () => {} },
      sendMessage: () => {},
    },
    storage: {
      local: {
        get: () => {},
        set: () => {},
      },
    },
  }
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings with API key from config
  chrome.storage.local.set({
    dogEnabled: true,
    dogPosition: { x: 20, y: 20 },
    aiKey: OPENAI_API_KEY,
  })
  console.log("BarkBuddy installed and initialized with API key from config")
})

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getAIResponse") {
    // Always use the stored API key
    chrome.storage.local.get(["aiKey"], (result) => {
      const apiKey = result.aiKey

      getAIResponse(request.prompt, apiKey)
        .then((response) => {
          sendResponse({ success: true, data: response })
        })
        .catch((error) => {
          console.error("AI Response error:", error)
          sendResponse({ success: false, error: error.message })
        })
    })
    return true // Required for async response
  }

  if (request.type === "getSettings") {
    chrome.storage.local.get(["dogEnabled", "dogPosition", "aiKey"], (result) => {
      sendResponse(result)
    })
    return true // Required for async response
  }

  if (request.type === "updateSettings") {
    chrome.storage.local.set(request.settings, () => {
      sendResponse({ success: true })
    })
    return true // Required for async response
  }

  return true // Keep the message channel open for other async responses
})

// Function to get AI response
async function getAIResponse(prompt, apiKey) {
  if (!apiKey) {
    throw new Error("API key not provided")
  }

  try {
    console.log("Sending request to OpenAI API")
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
      console.error("OpenAI API error:", errorData)
      throw new Error(errorData.error?.message || "Failed to get AI response")
    }

    const data = await response.json()
    console.log("Received response from OpenAI API")
    return data.choices[0].message.content
  } catch (error) {
    console.error("AI API error:", error)
    throw error
  }
}
