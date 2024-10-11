(function() {
    let lastQuery = '';
    let currentSite = '';

    // Detect dark mode
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    function initSwitcher() {
      const currentURL = window.location.href;

      if (currentURL.includes('google.com/search')) {
        currentSite = 'google';
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q') || '';
        updateButton(query);
      } else if (currentURL.includes('perplexity.ai')) {
        currentSite = 'perplexity';
        const query = extractPerplexityQuery();
        updateButton(query);
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
        buttonContainer.style.backgroundColor = '#333'; // Dark background for dark mode
        buttonContainer.style.color = '#fff'; // White text for dark mode
        buttonContainer.style.border = '1px solid #64ffda';; // Xaif green text for dark mode
      } else {
        buttonContainer.style.backgroundColor = '#fff'; // Light background for light mode
        buttonContainer.style.color = '#000'; // Black text for light mode
      }

      const googleIcon = document.createElement('img');
      googleIcon.src = chrome.runtime.getURL('icons/google-icon.svg');
      googleIcon.title = 'Search on Google';
      googleIcon.alt = 'Google Icon';

      const perplexityIcon = document.createElement('img');
      perplexityIcon.src = chrome.runtime.getURL('icons/perplexity-icon.svg');
      perplexityIcon.title = 'Search on Perplexity';
      perplexityIcon.alt = 'Perplexity Icon';

      [googleIcon, perplexityIcon].forEach(icon => {
        icon.style.width = '24px';
        icon.style.height = '24px';
        icon.style.margin = '0 15px';
        icon.style.cursor = 'pointer';
        icon.style.padding = '5px';
        icon.style.borderRadius = '50%';
        icon.style.boxSizing = 'content-box';
        icon.style.transition = 'transform 0.2s';
      });

      if (currentSite === 'google') {
        googleIcon.style.backgroundColor = isDarkMode ? '#444' : '#222'; 
      } else if (currentSite === 'perplexity') {
        perplexityIcon.style.backgroundColor = isDarkMode ? '#444' : '#222';
      }

      googleIcon.addEventListener('mouseover', function() {
        googleIcon.style.transform = 'scale(1.1)';
      });
      googleIcon.addEventListener('mouseout', function() {
        googleIcon.style.transform = 'scale(1)';
      });

      perplexityIcon.addEventListener('mouseover', function() {
        perplexityIcon.style.transform = 'scale(1.1)';
      });
      perplexityIcon.addEventListener('mouseout', function() {
        perplexityIcon.style.transform = 'scale(1)';
      });

      googleIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        if (currentSite !== 'google') {
          window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(query);
        }
      });

      perplexityIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        if (currentSite !== 'perplexity') {
          window.location.href = 'https://www.perplexity.ai/?q=' + encodeURIComponent(query);
        }
      });

      buttonContainer.appendChild(googleIcon);
      buttonContainer.appendChild(perplexityIcon);

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

    // Listen for changes in dark mode
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      isDarkMode = e.matches;
      updateButton(lastQuery); // Update button style when theme changes
    });
})();
