import { google } from "googleapis";
import { loadOAuth2Client } from "./oauth.js";

export const getUserEmail = async () => {
    const oauth2Client = await loadOAuth2Client();
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });
    return profile.data.emailAddress;
};

export const listTodayEmails = async () => {
    const oauth2Client = await loadOAuth2Client();
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // const formattedDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
    // const query = `after:${formattedDate}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timestamp = Math.floor(today.getTime() / 1000);
    const query = `after:${timestamp} -category:promotions -category:social -category:updates -in:spam`;
    // const query = "newer_than:1d";

    const res = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 5,
    });

    if (!res.data.messages) return [];

    const emails = await Promise.all(
        res.data.messages.map(async (msg) => {
            const message = await gmail.users.messages.get({ userId: "me", id: msg.id });
            const headers = message.data.payload.headers;
            const subject = headers.find(h => h.name === "Subject")?.value || "(No subject)";
            const from = headers.find(h => h.name === "From")?.value || "(Unknown sender)";
            const date = headers.find(h => h.name === "Date")?.value || "(No date)";

            let body = "";
            if (message.data.payload.parts) {
                const part = message.data.payload.parts.find(p => p.mimeType === "text/plain");
                if (part?.body?.data) {
                    body = Buffer.from(part.body.data, "base64").toString("utf8");
                }
            } else if (message.data.payload.body?.data) {
                body = Buffer.from(message.data.payload.body.data, "base64").toString("utf8");
            }

            return { from, subject, date, body };
        })
    );

    return emails;
};
