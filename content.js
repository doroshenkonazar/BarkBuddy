// Create and inject the dog element
function injectDog() {
  console.log("Injecting BarkBuddy dog into page")

  // Check if dog already exists
  if (document.getElementById("barkbuddy-container")) {
    console.log("BarkBuddy already exists on page")
    return
  }

  // Create dog container
  const dogContainer = document.createElement("div")
  dogContainer.id = "barkbuddy-container"
  dogContainer.className = "barkbuddy-container"

  // Create dog element
  const dogElement = document.createElement("div")
  dogElement.id = "barkbuddy-dog"
  dogElement.className = "barkbuddy-dog"

  // Create speech bubble
  const speechBubble = document.createElement("div")
  speechBubble.id = "barkbuddy-speech"
  speechBubble.className = "barkbuddy-speech hidden"

  // Create chat container
  const chatContainer = document.createElement("div")
  chatContainer.id = "barkbuddy-chat"
  chatContainer.className = "barkbuddy-chat hidden"

  // Create chat header
  const chatHeader = document.createElement("div")
  chatHeader.className = "barkbuddy-chat-header"
  chatHeader.innerHTML = '<span>BarkBuddy Chat</span><button id="barkbuddy-close-chat">×</button>'

  // Create chat messages container
  const chatMessages = document.createElement("div")
  chatMessages.id = "barkbuddy-messages"
  chatMessages.className = "barkbuddy-messages"

  // Create chat input
  const chatInput = document.createElement("div")
  chatInput.className = "barkbuddy-chat-input"
  chatInput.innerHTML = `
    <input type="text" id="barkbuddy-input" placeholder="Ask me anything...">
    <button id="barkbuddy-send">Send</button>
  `

  // Assemble chat container
  chatContainer.appendChild(chatHeader)
  chatContainer.appendChild(chatMessages)
  chatContainer.appendChild(chatInput)

  // Assemble dog container
  dogContainer.appendChild(dogElement)
  dogContainer.appendChild(speechBubble)
  dogContainer.appendChild(chatContainer)

  // Add to body
  document.body.appendChild(dogContainer)
  console.log("BarkBuddy added to page")

  // Set initial position from storage
  chrome.storage.local.get(["dogPosition"], (result) => {
    if (result.dogPosition) {
      dogContainer.style.left = `${result.dogPosition.x}px`
      dogContainer.style.top = `${result.dogPosition.y}px`
    } else {
      // Default position
      dogContainer.style.left = "20px"
      dogContainer.style.top = "20px"
    }
  })

  // Add dog animations
  loadDogAnimations(dogElement)

  // Add event listeners
  setupEventListeners(dogContainer, dogElement, speechBubble, chatContainer)

  // Show initial greeting
  setTimeout(() => {
    speechBubble.textContent = "Woof! I'm here to help!"
    speechBubble.classList.remove("hidden")

    setTimeout(() => {
      speechBubble.classList.add("hidden")
    }, 3000)
  }, 1000)
}

// Load dog animations
function loadDogAnimations(dogElement) {
  // For simplicity, we'll use CSS animations
  dogElement.innerHTML = `
    <div class="barkbuddy-dog-head"></div>
    <div class="barkbuddy-dog-body"></div>
    <div class="barkbuddy-dog-tail"></div>
  `

  // Start wagging immediately to show the dog is active
  dogElement.classList.add("wag")
  setTimeout(() => dogElement.classList.remove("wag"), 1000)

  // Randomly wag tail and blink
  setInterval(() => {
    if (Math.random() > 0.7) {
      dogElement.classList.add("wag")
      setTimeout(() => dogElement.classList.remove("wag"), 1000)
    }

    if (Math.random() > 0.9) {
      dogElement.classList.add("blink")
      setTimeout(() => dogElement.classList.remove("blink"), 200)
    }
  }, 2000)
}

// Set up event listeners
function setupEventListeners(container, dog, speech, chat) {
  // Make dog draggable
  let isDragging = false
  let offsetX, offsetY

  dog.addEventListener("mousedown", (e) => {
    isDragging = true
    offsetX = e.clientX - container.getBoundingClientRect().left
    offsetY = e.clientY - container.getBoundingClientRect().top
    container.classList.add("dragging")
  })

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const x = e.clientX - offsetX
      const y = e.clientY - offsetY
      container.style.left = `${x}px`
      container.style.top = `${y}px`
    }
  })

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false
      container.classList.remove("dragging")

      // Save position
      const x = Number.parseInt(container.style.left)
      const y = Number.parseInt(container.style.top)
      chrome.storage.local.set({ dogPosition: { x, y } })
    }
  })

  // Dog click to show speech or chat
  dog.addEventListener("click", () => {
    if (!isDragging) {
      if (chat.classList.contains("hidden")) {
        // Show random greeting in speech bubble
        const greetings = [
          "How's your day going?",
          "Need any help?",
          "Woof! What can I do for you?",
          "Click me again to chat!",
          "I can help summarize this page!",
        ]
        speech.textContent = greetings[Math.floor(Math.random() * greetings.length)]
        speech.classList.remove("hidden")

        // Hide speech after a few seconds
        setTimeout(() => {
          speech.classList.add("hidden")
          chat.classList.remove("hidden")
        }, 3000)
      } else {
        chat.classList.toggle("hidden")
      }
    }
  })

  // Close chat button
  const closeButton = document.getElementById("barkbuddy-close-chat")
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      chat.classList.add("hidden")
    })
  }

  // Send message
  const sendButton = document.getElementById("barkbuddy-send")
  const inputField = document.getElementById("barkbuddy-input")

  if (sendButton && inputField) {
    sendButton.addEventListener("click", sendMessage)
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage()
    })
  }

  // Function to send message to AI
  function sendMessage() {
    const input = document.getElementById("barkbuddy-input")
    if (!input) return

    const message = input.value.trim()

    if (message) {
      // Add user message to chat
      addMessageToChat("user", message)
      input.value = ""

      // Show thinking indicator
      addMessageToChat("dog", "...", "thinking")

      // Get page content for context
      const pageContent = document.body.innerText.slice(0, 1000)

      // Send message to background script for AI processing
      chrome.runtime.sendMessage(
        {
          type: "getAIResponse",
          prompt: `Context from current webpage: ${pageContent}\n\nUser question: ${message}\n\nRespond as a friendly dog assistant named BarkBuddy. Keep it brief and helpful.`,
        },
        (response) => {
          if (response && response.success) {
            updateThinkingMessage(response.data)
          } else {
            updateThinkingMessage(`Woof! I had trouble connecting to my brain. ${response?.error || "Unknown error"}`)
          }
        },
      )
    }
  }

  // Add message to chat
  function addMessageToChat(sender, text, className = "") {
    const messages = document.getElementById("barkbuddy-messages")
    if (!messages) return

    const messageElement = document.createElement("div")
    messageElement.className = `barkbuddy-message ${sender} ${className}`
    messageElement.textContent = text
    messages.appendChild(messageElement)
    messages.scrollTop = messages.scrollHeight
    return messageElement
  }

  // Update thinking message
  function updateThinkingMessage(text) {
    const thinkingMessage = document.querySelector(".barkbuddy-message.thinking")
    if (thinkingMessage) {
      thinkingMessage.textContent = text
      thinkingMessage.classList.remove("thinking")
    }
  }

  // Add special commands
  const inputElement = document.getElementById("barkbuddy-input")
  if (inputElement) {
    inputElement.addEventListener("input", (e) => {
      const input = e.target

      // Check for special commands
      if (input.value === "/summarize") {
        input.value = ""
        addMessageToChat("user", "Summarize this page")
        addMessageToChat("dog", "...", "thinking")

        const pageContent = document.body.innerText.slice(0, 2000)

        chrome.runtime.sendMessage(
          {
            type: "getAIResponse",
            prompt: `Summarize this webpage content in 3-4 sentences: ${pageContent}`,
          },
          (response) => {
            if (response && response.success) {
              updateThinkingMessage(response.data)
            } else {
              updateThinkingMessage(`Woof! I had trouble summarizing. ${response?.error || "Unknown error"}`)
            }
          },
        )
      }
    })
  }
}

// Inject the dog immediately when the content script loads
console.log("BarkBuddy content script loaded")
injectDog()

// Also check if dog should be enabled from storage
chrome.storage.local.get(["dogEnabled"], (result) => {
  console.log("Dog enabled setting:", result.dogEnabled)
  if (result.dogEnabled !== false) {
    // Double-check if dog is already injected
    if (!document.getElementById("barkbuddy-container")) {
      injectDog()
    }
  } else {
    // Remove dog if disabled
    const container = document.getElementById("barkbuddy-container")
    if (container) container.remove()
  }
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request.type)

  if (request.type === "toggleDog") {
    const container = document.getElementById("barkbuddy-container")

    if (request.enabled) {
      if (!container) injectDog()
    } else {
      if (container) container.remove()
    }

    sendResponse({ success: true })
  }

  if (request.type === "getPageContent") {
    const content = document.body.innerText.slice(0, 5000)
    sendResponse({ content })
  }

  if (request.type === "resetPosition") {
    const container = document.getElementById("barkbuddy-container")
    if (container) {
      container.style.left = "20px"
      container.style.top = "20px"
      chrome.storage.local.set({ dogPosition: { x: 20, y: 20 } })
      sendResponse({ success: true })
    } else {
      sendResponse({ success: false, error: "Dog not found on page" })
    }
  }

  if (request.type === "displaySummary") {
    const container = document.getElementById("barkbuddy-container")
    if (container) {
      const chat = document.getElementById("barkbuddy-chat")
      const messages = document.getElementById("barkbuddy-messages")

      if (chat && messages) {
        // Make sure chat is visible
        chat.classList.remove("hidden")

        // Add the summary as a message from the dog
        const messageElement = document.createElement("div")
        messageElement.className = "barkbuddy-message dog"
        messageElement.textContent = request.summary
        messages.appendChild(messageElement)
        messages.scrollTop = messages.scrollHeight
      }
    }
    sendResponse({ success: true })
  }

  return true // Required for async response
})
