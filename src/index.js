const core = require('@actions/core');
const axios = require('axios');

async function sendNotification() {
    try {
        // 🔹 Obtener inputs de la GitHub Action
        const webhookUrl = core.getInput('webhook_url');
        const message = core.getInput('message');
        const notifyOn = core.getInput('notify_on');
        const jobStatus = core.getInput('job_status') || "unknown";  // ✅ Asegurar que jobStatus esté definido
        const environment = core.getInput('environment') || "Not Set";
        const customFieldsInput = core.getInput('custom_fields') || "{}";

        console.log(`📢 Notification settings - notify_on: ${notifyOn}, job_status: ${jobStatus}, environment: ${environment}`);

        // 🔹 Construir la URL del workflow en GitHub Actions
        const githubBaseUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
        const githubRepo = process.env.GITHUB_REPOSITORY || "unknown/repo";
        const githubRunId = process.env.GITHUB_RUN_ID || "unknown_run";
        const workflowUrl = `${githubBaseUrl}/${githubRepo}/actions/runs/${githubRunId}`;

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
            failureMessage = `⚠️ **Error:** ${customFields["Error Details"] || "No details available."}\n🔍 **[View Logs](${workflowUrl})**`;
        }

        // 🔹 Construir payload para Microsoft Teams
        const payload = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": color,
            "summary": "GitHub Actions Job Notification",
            "sections": [{
                "activityTitle": `${statusEmoji} **GitHub Actions Workflow Finished!**`,
                "activitySubtitle": `[View Workflow Execution](${workflowUrl})`,
                "facts": [
                    { "name": "Repository", "value": githubRepo },
                    { "name": "Branch", "value": process.env.GITHUB_REF || "Unknown" },
                    { "name": "Commit", "value": process.env.GITHUB_SHA || "Unknown" },
                    { "name": "Status", "value": `**${jobStatus.toUpperCase()}**` },
                    { "name": "Triggered by", "value": process.env.GITHUB_ACTOR || "Unknown" },
                    { "name": "Environment", "value": environment }
                ],
                "markdown": true
            }]
        };

        // 🔹 Si falló, agregar la sección de error con la URL a los logs
        if (jobStatus !== "success") {
            payload.sections.push({
                "activityTitle": "🚨 **Error Detectado**",
                "text": failureMessage
            });
        }

        // 🔹 Agregar botón para abrir los logs en GitHub Actions
        payload.potentialAction = [
            {
                "@type": "OpenUri",
                "name": "🔍 View Logs",
                "targets": [{ "os": "default", "uri": workflowUrl }]
            }
        ];

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
