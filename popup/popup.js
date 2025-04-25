document.addEventListener("DOMContentLoaded", () => {
  // Load settings
  chrome.storage.local.get(["dogEnabled", "aiKey"], (result) => {
    document.getElementById("dogEnabled").checked = result.dogEnabled !== false

    // Show API key as already set
    const apiKeyField = document.getElementById("apiKey")
    if (apiKeyField) {
      if (result.aiKey) {
        apiKeyField.value = "••••••••••••••••••••••••••••••"
        apiKeyField.disabled = true
        document.querySelector(".hint").textContent = "API key is pre-configured"
      } else {
        apiKeyField.value = ""
      }
    }
  })

  // Toggle dog
  document.getElementById("dogEnabled").addEventListener("change", (e) => {
    const enabled = e.target.checked

    // Update storage
    chrome.storage.local.set({ dogEnabled: enabled })

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: "toggleDog",
            enabled,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log("Error sending message:", chrome.runtime.lastError.message)
              // Try to inject the content script if it's not already there
              if (enabled) {
                chrome.scripting
                  .executeScript({
                    target: { tabId: tabs[0].id },
                    files: ["content.js"],
                  })
                  .catch((err) => {
                    console.error("Error injecting content script:", err)
                  })
              }
            }
          },
        )
      }
    })

    showStatus("Settings saved!")
  })

  // Reset position
  document.getElementById("resetPosition").addEventListener("click", () => {
    chrome.storage.local.set({ dogPosition: { x: 20, y: 20 } })

    // Send direct message to content script to reset position
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "resetPosition" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error resetting position:", chrome.runtime.lastError.message)
            showStatus("Error: Content script not ready", true)

            // Try to inject the content script if it's not already there
            chrome.scripting
              .executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"],
              })
              .then(() => {
                // Try again after injecting
                setTimeout(() => {
                  chrome.tabs.sendMessage(tabs[0].id, { type: "resetPosition" }, (response) => {
                    if (!chrome.runtime.lastError && response && response.success) {
                      showStatus("Position reset!")
                    }
                  })
                }, 500)
              })
              .catch((err) => {
                console.error("Error injecting content script:", err)
                showStatus("Error resetting position", true)
              })
          } else if (response && response.success) {
            showStatus("Position reset!")
          } else {
            showStatus("Error resetting position", true)
          }
        })
      }
    })
  })

  // Summarize page
  document.getElementById("summarizePage").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "getPageContent" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message)
            showStatus("Error: Content script not ready", true)

            // Try to inject the content script if it's not already there
            chrome.scripting
              .executeScript({
                target: { tabId: tabs[0].id },
                files: ["content.js"],
              })
              .then(() => {
                showStatus("Please try again in a moment", true)
              })
              .catch((err) => {
                console.error("Error injecting content script:", err)
                showStatus("Error summarizing page", true)
              })

            return
          }

          if (response && response.content) {
            showStatus("Summarizing page...")

            chrome.runtime.sendMessage(
              {
                type: "getAIResponse",
                prompt: `Summarize this webpage content in 3-4 sentences: ${response.content}`,
              },
              (aiResponse) => {
                if (aiResponse && aiResponse.success) {
                  // Send summary to content script to display in chat
                  chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                      type: "displaySummary",
                      summary: aiResponse.data,
                    },
                    (response) => {
                      if (chrome.runtime.lastError) {
                        console.error("Error sending summary:", chrome.runtime.lastError.message)
                      }
                    },
                  )

                  showStatus("Summary sent to BarkBuddy!")
                } else {
                  showStatus("Error: " + (aiResponse ? aiResponse.error : "Unknown error"), true)
                }
              },
            )
          } else {
            showStatus("Could not get page content", true)
          }
        })
      }
    })
  })

  // Helper function to show status
  function showStatus(message, isError = false) {
    const status = document.getElementById("status")
    status.textContent = message
    status.style.color = isError ? "#f44336" : "#4caf50"

    setTimeout(() => {
      status.textContent = ""
    }, 3000)
  }
})
