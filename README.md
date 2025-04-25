### BarkBuddy Chrome Extension

## Overview

BarkBuddy is a friendly, AI-powered dog companion for your browser. It sits in the corner of your web pages, ready to chat, help summarize content, and provide assistance while you browse the web.


## Features

- 🐕 **Animated Dog Companion**: Cute Lottie animation that follows you across browser tabs
- 💬 **AI-Powered Chat**: Ask questions about the current page or get general assistance
- 📝 **Page Summarization**: Quickly get summaries of long articles or web pages
- 🔄 **Cross-Tab Support**: BarkBuddy follows you as you navigate across different websites
- 🖱️ **Draggable Interface**: Position the dog wherever you want on the screen
- 🔒 **Privacy-Focused**: Only sends page content to OpenAI when you specifically request help

  ![Screenshot 2025-04-25 183551](https://github.com/user-attachments/assets/ea7a0852-3b91-4b7e-a974-cffb9e4dd671)

  ![Screenshot 2025-04-25 183715](https://github.com/user-attachments/assets/49283254-f880-4406-98ac-b4d412e319cc)

  ![Screenshot 2025-04-25 184436](https://github.com/user-attachments/assets/90760ea0-ec8c-4311-900b-d8ccac06e9c4)


## Installation

### From Source Code

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the BarkBuddy directory
5. The extension should now be installed and active


### Configuration

BarkBuddy comes pre-configured with an API key, but you can use your own:

1. Create an `env` file in the extension directory
2. Insert your own `OPENAI_API_KEY`from OpenAI API key
3. Reload the extension from the Chrome extensions page


## Usage

### Basic Interaction

- **Click the dog** to open the chat interface
- **Drag the dog** to reposition it on the page
- **Type messages** in the chat box to ask questions or get help
- **Click the X** in the chat header to close the chat


### Special Commands

- Type `/summarize` in the chat to get a quick summary of the current page


### Extension Popup

Click the BarkBuddy icon in your browser toolbar to access these options:

- **Enable/Disable BarkBuddy**: Toggle the dog's presence on web pages
- **Reset Position**: Move the dog back to its default position
- **Summarize Page**: Generate a summary of the current page


## Technical Details

BarkBuddy is built using:

- **JavaScript**: Core extension functionality
- **Chrome Extension API**: For browser integration
- **Lottie**: For the animated dog character
- **OpenAI API**: For AI-powered chat and summarization


### File Structure

```plaintext
BarkBuddy/
├── manifest.json        # Extension configuration
├── background.js        # Background service worker
├── content.js           # Content script injected into pages
├── config.js            # API key configuration
├── popup/
│   ├── popup.html       # Popup interface HTML
│   ├── popup.js         # Popup functionality
│   └── popup.css        # Popup styling
├── utils/
│   └── ai.js            # AI utility functions
└── icons/
    ├── icon16.png       # Extension icons
    ├── icon48.png
    └── icon128.png
```

## Troubleshooting

### Dog Not Appearing

If the dog doesn't appear on a page:

1. Check if the extension is enabled in Chrome's extension menu
2. Try clicking the BarkBuddy icon and toggling the "Enable BarkBuddy" switch
3. Click "Reset Position" to ensure the dog isn't positioned off-screen
4. Reload the page


### Chat Not Working

If the AI chat isn't responding:

1. Check your internet connection
2. Verify the API key in `config.js` is valid
3. Check the browser console for any error messages
4. Try reloading the extension


## Privacy

BarkBuddy only sends the following data to OpenAI:

- Page content when you explicitly request a summary
- Your chat messages and limited page context when you ask questions
- No browsing data is collected or stored


## Credits

- Dog animation from [LottieFiles](https://lottiefiles.com)
- AI functionality powered by [OpenAI](https://openai.com)
- Extension developed by Kester Nkese


## License

This project is licensed under the MIT License - see the LICENSE file for details.
