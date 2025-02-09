const core = require('@actions/core');
const axios = require('axios');

async function sendNotification() {
    try {
        // 🔹 Obtener inputs de la GitHub Action
        const webhookUrl = core.getInput('webhook_url');
        const message = core.getInput('message');
        const notifyOn = core.getInput('notify_on');
        const jobStatus = core.getInput('job_status');  // ✅ Se asegura de que esté definido
        const environment = core.getInput('environment') || "Not Set";
        const customFieldsInput = core.getInput('custom_fields') || "{}";

        console.log(`📢 Notification settings - notify_on: ${notifyOn}, job_status: ${jobStatus}, environment: ${environment}`);

        // 🔹 Validar que jobStatus tenga un valor válido
        if (!jobStatus) {
            core.setFailed("❌ Error: 'job_status' input is missing or invalid.");
            return;
        }

        // 🔹 Parsear custom fields
        let customFields = {};
        try {
            customFields = JSON.parse(customFieldsInput);
            if (typeof customFields !== 'object') {
                throw new Error("Custom fields must be a JSON object.");
            }
        } catch (error) {
            console.warn("⚠️ Invalid JSON format for custom_fields. Skipping...");
            customFields = {};
        }

        // 🔹 Determinar color y emojis según el estado del job
        let color = "00FF00"; // Verde para éxito
        let statusEmoji = "✅"; // Check verde
        let failureMessage = ""; // Mensaje de error adicional

        if (jobStatus !== "success") {
            color = "FF0000"; // Rojo para fallo
            statusEmoji = "❌"; // Cruz roja
            failureMessage = `⚠️ **Error:** ${customFields.error || "No details available."}`;
        }

        // 🔹 Construir payload para Microsoft Teams
        const payload = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": color,
            "summary": "GitHub Actions Job Notification",
            "sections": [{
                "activityTitle": `${statusEmoji} **GitHub Actions Workflow Finished!**`,
                "activitySubtitle": "GitHub Actions Workflow Notification",
                "facts": [
                    { "name": "Repository", "value": process.env.GITHUB_REPOSITORY },
                    { "name": "Branch", "value": process.env.GITHUB_REF },
                    { "name": "Commit", "value": process.env.GITHUB_SHA },
                    { "name": "Status", "value": `**${jobStatus.toUpperCase()}**` }, // ✅ jobStatus ya no estará indefinido
                    { "name": "Triggered by", "value": process.env.GITHUB_ACTOR },
                    { "name": "Environment", "value": environment }
                ],
                "markdown": true
            }]
        };

        // 🔹 Si falló, agregar la sección de error
        if (jobStatus !== "success") {
            payload.sections.push({
                "activityTitle": "🚨 **Error Detectado**",
                "text": failureMessage
            });
        }

        // 🔹 Enviar la notificación al webhook único
        try {
            await axios.post(webhookUrl, payload);
            console.log(`✅ Notification sent successfully to ${webhookUrl}`);
        } catch (error) {
            console.warn(`⚠️ Failed to send notification: ${error.message}`);
        }

    } catch (error) {
        core.setFailed(`❌ Failed to send notification: ${error.message}`);
    }
}

sendNotification();
