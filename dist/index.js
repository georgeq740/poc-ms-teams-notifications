/******/ (() => { // webpackBootstrap
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// Agregar campos personalizados si existen
const payloadFacts = [
    { "name": "Repository", "value": process.env.GITHUB_REPOSITORY },
    { "name": "Branch", "value": process.env.GITHUB_REF },
    { "name": "Commit", "value": process.env.GITHUB_SHA },
    { "name": "Status", "value": `**${jobStatus.toUpperCase()}**` },
    { "name": "Triggered by", "value": process.env.GITHUB_ACTOR },
    { "name": "Environment", "value": environment }
];

// Si el error tiene contenido, agregarlo
if (errorMessage && errorMessage !== "No details available.") {
    payloadFacts.push({ "name": "Error", "value": errorMessage });
}

// Si hay custom fields, agregarlos
Object.keys(customFields).forEach(key => {
    if (customFields[key]) {
        payloadFacts.push({ "name": key, "value": customFields[key] });
    }  // <-- Este corchete estaba mal en la versión anterior
});


// Crear payload para Microsoft Teams
const payload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": color,
    "summary": "GitHub Actions Job Notification",
    "sections": [{
        "activityTitle": `${statusEmoji} **GitHub Actions Workflow Finished!**`,
        "activitySubtitle": "GitHub Actions Workflow Notification",
        "facts": payloadFacts,
        "markdown": true
    }]
};

module.exports = __webpack_exports__;
/******/ })()
;