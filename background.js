/******/ (() => {
  // webpackBootstrap
  var __webpack_exports__ = {};
  /*!***************************************************!*\
  !*** ./node_modules/@inboxsdk/core/background.js ***!
  \***************************************************/
  const getCookies = async () => {
    const url1 = "https://auth.textaify.com/";
    const uid = decodeURIComponent(
      (await chrome.cookies.get({ name: "uid", url: url1 })).value
    );
    const expiryTime = decodeURIComponent(
      (await chrome.cookies.get({ name: "expiryTime", url: url1 })).value
    );
    const idToken = decodeURIComponent(
      (
        await chrome.cookies.get({
          name: "userToken",
          url: url1,
        })
      ).value
    );
    const refToken = decodeURIComponent(
      (
        await chrome.cookies.get({
          name: "refToken",
          url: url1,
        })
      ).value
    );
    return { refToken, uid, expiryTime, idToken };
  };

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.type === "inboxsdk__injectPageWorld" && sender.tab) {
        if (chrome.scripting) {
          // MV3
          chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            world: "MAIN",
            files: ["pageWorld.js"],
          });
          sendResponse(true);
        } else {
          // MV2 fallback. Tell content script it needs to figure things out.
          sendResponse(false);
        }
      }
      if (message.query) {
        const cookies = await getCookies();
        const reqbody = {
          max_tokens: 500,
          messages: [{ role: "user", content: message.query }],
        };
        let response = await fetch("https://auth.textaify.com/req/chat", {
          method: "POST",
          mode: "cors",
          headers: {
            "x-auth-api": cookies.idToken,
            "x-auth-uid": cookies.uid,
            "x-auth-expiry": cookies.expiryTime,
            "x-auth-reftoken": cookies.refToken,
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(reqbody),
        });
        response = await response.json();
        console.log(response.content);
        if (response.token && response.refToken && response.expiry) {
          await chrome.cookies.set({
            domain: "https://auth.textaify.com",

            expirationDate: 31 * 60 * 60 * 24 * 1000,
            name: "userToken",
            value: response.token,
          });
          await chrome.cookies.set({
            domain: "https://auth.textaify.com",

            expirationDate: 31 * 60 * 60 * 24 * 1000,
            name: "refToken",
            value: response.refToken,
          });
          await chrome.cookies.set({
            domain: "https://auth.textaify.com",

            expirationDate: 31 * 60 * 60 * 24 * 1000,
            name: "expiryTime",
            value: response.expiry,
          });
        }
        if (response.content) {
          response.content = response.content.trim().replaceAll("\n", "<br>");
        }

        let retrievedTabId = sender.tab.id;
        await chrome.tabs.sendMessage(retrievedTabId, {
          body: response.content,
        });
      }
    }
  );

  /******/
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQSw4REFBOEQsd0JBQXdCO0FBQ3RGLHFFQUFxRSwrQkFBK0I7QUFDcEc7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxVQUFVOztBQUVWOzs7OztBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isc0JBQXNCO0FBQ3hDO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsa0NBQWtDOztBQUVqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7OztBQUdBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9oZWxsby13b3JsZC8uL25vZGVfbW9kdWxlcy9AaW5ib3hzZGsvY29yZS9iYWNrZ3JvdW5kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGdldENvb2tpZXMgPSBhc3luYyAoKT0+
