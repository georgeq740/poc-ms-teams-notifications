const core = require('@actions/core');
const axios = require('axios');

async function sendNotification() {
    try {
        // Obtener los webhooks (pueden ser múltiples, separados por comas)
        const webhookUrls = core.getInput('webhook_urls').split(',').map(url => url.trim());
        const message = core.getInput('message');
        const notifyOn = core.getInput('notify_on'); // Puede ser 'success', 'failure' o 'both'
        const jobStatus = core.getInput('job_status'); // Estado del job en GitHub Actions
        const errorMessage = core.getInput('error_message') || "No error details available."; // Mensaje de error

        // Capturar el **environment** desde GitHub o desde un input opcional
        const githubEnvironment = process.env.GITHUB_ENVIRONMENT || core.getInput('environment') || "Not Set";

        // Capturar campos personalizados (si los usuarios los proporcionan)
        const customFieldsRaw = core.getInput('custom_fields') || "";
        const customFields = customFieldsRaw.split(',').map(field => field.trim());

        console.log(`📢 Notification settings - notify_on: ${notifyOn}, job_status: ${jobStatus}, environment: ${githubEnvironment}`);

        if (notifyOn === 'both' || 
            (notifyOn === 'failure' && jobStatus !== 'success') || 
            (notifyOn === 'success' && jobStatus === 'success')) {

            // 🔹 Definir color y emoji según estado
            let color = "00FF00"; // Verde para éxito
            let statusEmoji = "✅"; // Check verde
            let failureMessage = "";

            if (jobStatus === "failure") {
                color = "FF0000"; // Rojo para fallo
                statusEmoji = "❌"; // Cruz roja
                failureMessage = `⚠️ **Error:** ${errorMessage}`;
            } else if (jobStatus === "cancelled") {
                color = "FFA500"; // Naranja para cancelado
                statusEmoji = "⚠️";
            } else if (jobStatus === "skipped") {
                color = "A9A9A9"; // Gris para saltado
                statusEmoji = "⏭";
            } else if (jobStatus === "in_progress") {
                color = "0000FF"; // Azul para en progreso
                statusEmoji = "🔄";
            }

            // 🔹 Calcular duración del workflow
            const startTime = process.env.GITHUB_WORKFLOW_STARTED_AT;
            const endTime = new Date().toISOString();
            let durationMessage = "N/A";

            if (startTime) {
                const duration = (new Date(endTime) - new Date(startTime)) / 1000;
                durationMessage = `${duration.toFixed(2)} seconds`;
            }

            // 🔹 Crear payload base para Microsoft Teams
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
                        { "name": "Status", "value": `**${jobStatus.toUpperCase()}**` },
                        { "name": "Triggered by", "value": process.env.GITHUB_ACTOR },
                        { "name": "Environment", "value": githubEnvironment }, // ✅ Se agrega el Environment
                        { "name": "Execution Time", "value": durationMessage }
                    ],
                    "markdown": true
                }]
            };

            // 🔹 Si falló, agregar sección con el mensaje de error
            if (jobStatus === "failure") {
                payload.sections.push({
                    "activityTitle": "🚨 **Error Detectado**",
                    "text": failureMessage
                });
            }

            // 🔹 Agregar campos personalizados si existen
            if (customFieldsRaw) {
                const customFacts = customFields.map(field => {
                    const [key, value] = field.split('=');
                    return { "name": key.trim(), "value": value.trim() };
                });

                payload.sections[0].facts.push(...customFacts);
            }

            // 🔹 Agregar botón para ver logs en GitHub Actions
            const runId = process.env.GITHUB_RUN_ID;
            const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${runId}`;

            payload.potentialAction = [
                {
                    "@type": "OpenUri",
                    "name": "🔍 View Logs",
                    "targets": [{ "os": "default", "uri": repoUrl }]
                }
            ];

            // 🔹 Enviar la notificación a todos los webhooks configurados
            for (const url of webhookUrls) {
                await axios.post(url, payload);
                console.log(`✅ Notification sent successfully to: ${url}`);
            }
        } else {
            console.log("ℹ️ Notification skipped based on notify_on setting.");
        }
    } catch (error) {
        core.setFailed(`❌ Failed to send notification: ${error.message}`);
    }
}

sendNotification();