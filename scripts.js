// Define a function that gets the list of open tabs
async function getTabs() {
  try {
    // Fetch the configuration from the Express server
    let response = await fetch("https://ankiserver.adaptable.app/blocker");
    let data = await response.json();

    if (data.blocked) {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => {
          let shouldClose = data.websites.every(allowedUrl => !tab.url.includes(allowedUrl));

          if (shouldClose) {
            chrome.tabs.remove(tab.id);
          }
        });
      });
    }
  } catch (error) {
    console.error('Error fetching blocker configuration:', error);
  }
}

// Define a variable for the interval in milliseconds
var interval = 5000; // 5 seconds

// Use the setInterval function to call the getTabs function every N seconds
setInterval(getTabs, interval);
