/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 974:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 461:
/***/ ((module) => {

module.exports = eval("require")("axios");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(974);
const axios = __nccwpck_require__(461);

async function sendNotification() {
    try {
        const webhookUrl = core.getInput('webhook_url');
        const message = core.getInput('message');
        const notifyOn = core.getInput('notify_on'); // Puede ser 'success', 'failure' o 'both'
        const jobStatus = core.getInput('job_status'); // Estado del job en GitHub Actions

        console.log(`📢 Notification settings - notify_on: ${notifyOn}, job_status: ${jobStatus}`);
        
        if (notifyOn === 'both' || 
            (notifyOn === 'failure' && jobStatus !== 'success') || 
            (notifyOn === 'success' && jobStatus === 'success')) {

            const payload = { text: message };
            await axios.post(webhookUrl, payload);
            console.log("✅ Notification sent successfully!");
        } else {
            console.log("ℹ️ Notification skipped based on notify_on setting.");
        }
    } catch (error) {
        core.setFailed(`❌ Failed to send notification: ${error.message}`);
    }
}

sendNotification();
module.exports = __webpack_exports__;
/******/ })()
;