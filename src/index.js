const core = require('@actions/core');
const axios = require('axios');

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