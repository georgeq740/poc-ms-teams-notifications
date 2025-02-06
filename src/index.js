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

            // 🔹 Definir color y mensaje según estado
            let color = "00FF00"; // Verde para éxito
            let statusEmoji = "✅"; // Check verde
            let failureMessage = ""; // Mensaje adicional si falla

            if (jobStatus !== "success") {
                color = "FF0000"; // Rojo para fallo
                statusEmoji = "❌"; // Cruz roja
                failureMessage = "\n⚠️ **Tarea pendiente:** Revisar logs y corregir errores."; // Mensaje extra
            }

            // 🔹 Crear payload para Microsoft Teams con sección de fallo
            const payload = {
                "@type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "themeColor": color,
                "summary": "GitHub Actions Job Notification",
                "sections": [{
                    "activityTitle": `${statusEmoji} **GitHub Actions Workflow Finished!**`,
                    "activitySubtitle": "GitHub Actions Workflow Notification",
                    "facts": [{
                        "name": "Repository",
                        "value": process.env.GITHUB_REPOSITORY
                    }, {
                        "name": "Branch",
                        "value": process.env.GITHUB_REF
                    }, {
                        "name": "Commit",
                        "value": process.env.GITHUB_SHA
                    }, {
                        "name": "Status",
                        "value": `**${jobStatus.toUpperCase()}**`
                    }, {
                        "name": "Triggered by",
                        "value": process.env.GITHUB_ACTOR
                    }],
                    "markdown": true
                }]
            };

            // 🔹 Si falló, agregar sección de "Tarea Pendiente"
            if (jobStatus !== "success") {
                payload.sections.push({
                    "activityTitle": "🚨 **Acción Requerida**",
                    "text": failureMessage
                });
            }

            // 🔹 Enviar la notificación a Microsoft Teams
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
