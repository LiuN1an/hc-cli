try {
//   chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
//     if (info.status === "complete") {
//       chrome.scripting.executeScript({
//         files: ["content.js"],
//         target: { tabId: tab.id },
//       });
//     }
//   });
} catch (e) {
  console.log(e);
}
