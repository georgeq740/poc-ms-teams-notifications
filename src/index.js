const core = require('@actions/core');
const axios = require('axios');

async function sendNotification() {
    try {
        const webhookUrl = core.getInput('webhook_url');
        const message = core.getInput('message');

        const payload = {
            text: message
        };

        await axios.post(webhookUrl, payload);
        console.log("✅ Notification sent successfully!");
    } catch (error) {
        core.setFailed(`❌ Failed to send notification: ${error.message}`);
    }
}

sendNotification();