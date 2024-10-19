(function() {
  let lastQuery = '';
  let currentSite = '';
  let previousSearchEngine = '';

  // Detect dark mode
  let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function initSwitcher() {
    const currentURL = window.location.href;

    if (currentURL.includes('google.com/search')) {
      currentSite = 'google';
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q') || '';
      chrome.storage.local.set({ previousSearchEngine: 'google' }, function() {
        updateButton(query);
      });
    } else if (currentURL.includes('perplexity.ai')) {
      currentSite = 'perplexity';
      chrome.storage.local.get('previousSearchEngine', function(result) {
        previousSearchEngine = result.previousSearchEngine || 'google'; // Default to Google if not set
        const query = extractPerplexityQuery();
        updateButton(query);
      });
    } else if (currentURL.includes('search.brave.com')) {
      currentSite = 'brave';
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q') || '';
      chrome.storage.local.set({ previousSearchEngine: 'brave' }, function() {
        updateButton(query);
      });
    }
  }

  function extractPerplexityQuery() {
    const queryElement = document.querySelector('input[placeholder="Ask anything..."]');
    if (queryElement && queryElement.value) {
      return queryElement.value.trim();
    }

    const questionElement = document.querySelector('h1');
    if (questionElement && questionElement.textContent) {
      return questionElement.textContent.trim();
    }

    return '';
  }

  function updateButton(query) {
    if (!query || query === lastQuery) {
      return;
    }
    lastQuery = query;

    const existingContainer = document.getElementById('gp-switcher-button-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    injectButton(query, currentSite);
  }

  function injectButton(query, currentSite) {
    const container = document.createElement('div');
    container.id = 'gp-switcher-button-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '10000';

    const shadow = container.attachShadow({ mode: 'closed' });
    const buttonContainer = document.createElement('div');

    // Style for the button container
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.padding = '10px 0px';
    buttonContainer.style.border = '1px solid #0a1930';
    buttonContainer.style.borderRadius = '50px';
    buttonContainer.style.boxShadow = '0 2px 3px rgba(0, 0, 0, 0.3)';

    // Dark/Light mode handling
    if (isDarkMode) {
      buttonContainer.style.backgroundColor = '#333'; // Dark background
      buttonContainer.style.color = '#fff'; // White text
      buttonContainer.style.border = '1px solid #64ffda';
    } else {
      buttonContainer.style.backgroundColor = '#fff'; // Light background
      buttonContainer.style.color = '#000'; // Black text
    }

    // Create icons
    const googleIcon = document.createElement('img');
    googleIcon.src = chrome.runtime.getURL('icons/google-icon.svg');
    googleIcon.title = 'Search on Google';
    googleIcon.alt = 'Google Icon';

    const perplexityIcon = document.createElement('img');
    perplexityIcon.src = chrome.runtime.getURL('icons/perplexity-icon.svg');
    perplexityIcon.title = 'Search on Perplexity';
    perplexityIcon.alt = 'Perplexity Icon';

    const braveIcon = document.createElement('img');
    braveIcon.src = chrome.runtime.getURL('icons/brave-icon.svg');
    braveIcon.title = 'Search on Brave';
    braveIcon.alt = 'Brave Icon';

    // Determine which icons to display
    let icons = [];

    // Perplexity icon is always in the second position
    if (currentSite === 'google') {
      icons = [googleIcon, perplexityIcon];
    } else if (currentSite === 'brave') {
      icons = [braveIcon, perplexityIcon];
    } else if (currentSite === 'perplexity') {
      // Display previous search engine icon and Perplexity icon
      if (previousSearchEngine === 'google') {
        icons = [googleIcon, perplexityIcon];
      } else if (previousSearchEngine === 'brave') {
        icons = [braveIcon, perplexityIcon];
      } else {
        // Default to Google if previousSearchEngine is not set
        icons = [googleIcon, perplexityIcon];
      }
    }

    // Ensure only two icons are displayed
    icons = icons.slice(0, 2);

    icons.forEach(icon => {
      icon.style.width = '24px';
      icon.style.height = '24px';
      icon.style.margin = '0 15px';
      icon.style.cursor = 'pointer';
      icon.style.padding = '5px';
      icon.style.borderRadius = '50%';
      icon.style.boxSizing = 'content-box';
      icon.style.transition = 'transform 0.2s';
    });

    // Highlight the current site's icon
    icons.forEach(icon => {
      if (
        (currentSite === 'google' && icon === googleIcon) ||
        (currentSite === 'perplexity' && icon === perplexityIcon) ||
        (currentSite === 'brave' && icon === braveIcon)
      ) {
        icon.style.backgroundColor = isDarkMode ? '#444' : '#222';
      }
    });

    // Add event listeners
    if (icons.includes(googleIcon)) {
      googleIcon.addEventListener('mouseover', function() {
        googleIcon.style.transform = 'scale(1.1)';
      });
      googleIcon.addEventListener('mouseout', function() {
        googleIcon.style.transform = 'scale(1)';
      });
      googleIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        if (currentSite !== 'google') {
          chrome.storage.local.set({ previousSearchEngine: 'perplexity' }, function() {
            window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(query);
          });
        }
      });
    }

    if (icons.includes(perplexityIcon)) {
      perplexityIcon.addEventListener('mouseover', function() {
        perplexityIcon.style.transform = 'scale(1.1)';
      });
      perplexityIcon.addEventListener('mouseout', function() {
        perplexityIcon.style.transform = 'scale(1)';
      });
      perplexityIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        if (currentSite !== 'perplexity') {
          chrome.storage.local.set({ previousSearchEngine: currentSite }, function() {
            window.location.href = 'https://www.perplexity.ai/?q=' + encodeURIComponent(query);
          });
        }
      });
    }

    if (icons.includes(braveIcon)) {
      braveIcon.addEventListener('mouseover', function() {
        braveIcon.style.transform = 'scale(1.1)';
      });
      braveIcon.addEventListener('mouseout', function() {
        braveIcon.style.transform = 'scale(1)';
      });
      braveIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        if (currentSite !== 'brave') {
          chrome.storage.local.set({ previousSearchEngine: 'perplexity' }, function() {
            window.location.href = 'https://search.brave.com/search?q=' + encodeURIComponent(query);
          });
        }
      });
    }

    // Append icons to the container
    icons.forEach(icon => {
      buttonContainer.appendChild(icon);
    });

    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(buttonContainer);
    document.body.appendChild(container);
  }

  initSwitcher();

  // Observe changes for dynamic content
  if (window.location.hostname.includes('perplexity.ai')) {
    const targetNode = document.querySelector('main');
    const observerOptions = {
      childList: true,
      subtree: true,
    };

    if (targetNode) {
      const observer = new MutationObserver(() => {
        const query = extractPerplexityQuery();
        updateButton(query);
      });

      observer.observe(targetNode, observerOptions);
    }
  }

  if (window.location.hostname.includes('google.com')) {
    const observer = new MutationObserver(() => {
      initSwitcher();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (window.location.hostname.includes('search.brave.com')) {
    const observer = new MutationObserver(() => {
      initSwitcher();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Listen for changes in dark mode
  window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
    isDarkMode = e.matches;
    updateButton(lastQuery); // Update button style when theme changes
  });
})();
