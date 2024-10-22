# Search Engine Switcher Extension

A lightweight browser extension that adds a floating button to switch between search engines seamlessly. It allows users to switch between Google, Perplexity, Brave, and DuckDuckGo search engines while preserving the current search query.

## Features

- **Two-Icon Display**: Shows only two icons at a time for a cleaner interface.
- **Remembers Previous Search Engine**: When navigating to Perplexity, the extension remembers the previous search engine you came from. Defaults to Google if Perplexity is opened directly.
- **Dark Mode Support**: Automatically adapts to your system's dark or light theme.
- **Dynamic Content Observation**: Observes changes on dynamic pages to update the button accordingly.

## How It Works

The extension injects a floating button on supported search engine pages. The button displays icons for the current search engine and Perplexity (or the previous search engine when on Perplexity). Clicking an icon redirects you to the corresponding search engine with your current query.

## Supported Search Engines

- Google
- Perplexity
- Brave
- DuckDuckGo

## Installation

1. **Clone or Download the Repository**: Download the extension code to your local machine.

2. **Prepare the Icons**: Ensure you have the following icons saved in an `icons` directory within your extension folder:

   - `google-icon.svg`
   - `perplexity-icon.svg`
   - `brave-icon.svg`
   - `duckduckgo-icon.svg`

3. **Create `manifest.json`**: Include a `manifest.json` file in the extension folder with the appropriate permissions and content scripts.

   ```json
   {
     "manifest_version": 3,
     "name": "Search Engine Switcher",
     "version": "1.0",
     "description": "Switch between search engines seamlessly.",
     "permissions": ["storage"],
     "content_scripts": [
       {
         "matches": ["*://*.google.com/*", "*://*.perplexity.ai/*", "*://*.search.brave.com/*", "*://*.duckduckgo.com/*"],
         "js": ["contentScript.js"]
       }
     ],
     "icons": {
       "16": "icons/icon16.png",
       "48": "icons/icon48.png",
       "128": "icons/icon128.png"
     }
   }
   ```

4. **Load the Extension in Your Browser**:

   - **Chrome**:
     - Go to `chrome://extensions/`.
     - Enable **Developer mode**.
     - Click on **Load unpacked**.
     - Select the extension folder.

   - **Firefox**:
     - Go to `about:debugging#/runtime/this-firefox`.
     - Click on **Load Temporary Add-on**.
     - Select the `manifest.json` file from the extension folder.

## Usage

1. **Navigate to a Supported Search Engine**: Go to Google, Brave, DuckDuckGo, or Perplexity and perform a search.

2. **Use the Floating Button**:

   - The button appears at the bottom-right corner of the page.
   - It displays two icons:
     - **Current Search Engine Icon**: Indicates where you are.
     - **Perplexity or Previous Search Engine Icon**: Allows you to switch to Perplexity or back to your previous search engine.

3. **Switch Search Engines**:

   - **Click an Icon**: Redirects you to the selected search engine with the same query.
   - **Mouse Over Effects**: Icons scale up slightly on hover for a visual cue.

## Customization

- **Dark Mode Styles**: The button automatically adjusts to dark or light themes based on your system settings.
- **Icon Highlighting**: The current site's icon is highlighted with a darker background.

## Code Overview

The extension consists of a self-invoking function that:

- **Variables**:
  - `lastQuery`: Stores the last processed search query to prevent redundant updates.
  - `currentSite`: Identifies the current search engine.
  - `previousSearchEngine`: Remembers the previous search engine when on Perplexity.

- **Functions**:
  - `initSwitcher()`: Initializes the button based on the current URL.
  - `extractPerplexityQuery()`: Extracts the search query from Perplexity's interface.
  - `updateButton(query)`: Updates or injects the button with the current query.
  - `injectButton(query, currentSite)`: Creates the button element, styles it, and adds event listeners.

- **Event Listeners and Observers**:
  - **MutationObserver**: Observes DOM changes to update the button when dynamic content changes.
  - **Media Query Listener**: Updates the button styles when the system's dark mode setting changes.

## Notes

- **Storage Permissions**: The extension uses `chrome.storage.local` to store and retrieve the previous search engine.
- **Compatibility**: Designed for Chromium-based browsers and may require adjustments for full compatibility with Firefox.
- **Error Handling**: Ensure that the icons are correctly referenced in the code to prevent broken images.

## Troubleshooting

- **Button Not Appearing**: Check that the content scripts are correctly injected and that the extension has the necessary permissions.
- **Icons Not Displaying**: Verify that the icon paths are correct and that the images are in the specified directory.
- **Unexpected Behavior**: Use the browser's developer tools to inspect the console for any errors.

## Contributing

Feel free to submit issues or pull requests for improvements or additional features.

## License

This project is licensed under the MIT License.

---

**Disclaimer**: This extension is a sample project and should be reviewed and tested thoroughly before deployment. Use at your own risk.