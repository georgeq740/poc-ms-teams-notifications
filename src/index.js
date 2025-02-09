const core = require('@actions/core');
const axios = require('axios');

async function sendNotification() {
    try {
        const webhookUrl = core.getInput('webhook_url');
        const webhookUrls = core.getInput('webhook_urls');
        const message = core.getInput('message');
        const notifyOn = core.getInput('notify_on');
        const jobStatus = core.getInput('job_status');
        const environment = core.getInput('environment') || "Not Set";
        const errorMessage = core.getInput('error_message') || "No error details available.";
        const customFields = core.getInput('custom_fields') || "{}";

        console.log(`📢 Notification settings - notify_on: ${notifyOn}, job_status: ${jobStatus}, environment: ${environment}`);

        let color = "00FF00"; // Verde para éxito
        let statusEmoji = "✅"; // Check verde
        let failureMessage = "";

        if (jobStatus !== "success") {
            color = "FF0000"; // Rojo para fallo
            statusEmoji = "❌"; // Cruz roja
            failureMessage = `⚠️ **Error:** ${errorMessage}`;
        }

        const payload = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": color,
            "summary": "GitHub Actions Job Notification",
            "sections": [{
                "activityTitle": `${statusEmoji} **GitHub Actions Workflow Finished!**`,
                "activitySubtitle": `GitHub Actions Workflow in **${environment}**`,
                "facts": [
                    { "name": "Repository", "value": process.env.GITHUB_REPOSITORY },
                    { "name": "Branch", "value": process.env.GITHUB_REF },
                    { "name": "Commit", "value": process.env.GITHUB_SHA },
                    { "name": "Status", "value": `**${jobStatus.toUpperCase()}**` },
                    { "name": "Triggered by", "value": process.env.GITHUB_ACTOR }
                ],
                "markdown": true
            }]
        };

        if (jobStatus !== "success") {
            payload.sections.push({
                "activityTitle": "🚨 **Error Detectado**",
                "text": failureMessage
            });
        }

        // Agregar campos personalizados
        try {
            const customFieldsParsed = JSON.parse(customFields);
            for (const [key, value] of Object.entries(customFieldsParsed)) {
                payload.sections[0].facts.push({ "name": key, "value": value });
            }
        } catch (error) {
            console.log("⚠️ Invalid JSON format for custom_fields. Skipping...");
        }

        // Convertir múltiples webhooks en una lista
        const webhooks = webhookUrls ? webhookUrls.split(",") : [webhookUrl];

        for (const url of webhooks) {
            if (!url.startsWith("http")) {
                console.log(`⚠️ Skipping invalid URL: ${url}`);
                continue;
            }
            await axios.post(url, payload);
            console.log(`✅ Notification sent successfully to ${url}`);
        }

    } catch (error) {
        core.setFailed(`❌ Failed to send notification: ${error.message}`);
    }
}

sendNotification();
