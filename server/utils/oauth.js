import { google } from "googleapis";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const SCOPES = ["https://mail.google.com/"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

let oauth2Client;

export const loadOAuth2Client = async () => {
    if (oauth2Client) return oauth2Client;

    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const { client_id, client_secret, redirect_uris } = keys.web;

    oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    if (fsSync.existsSync(TOKEN_PATH)) {
        const token = await fs.readFile(TOKEN_PATH);
        oauth2Client.setCredentials(JSON.parse(token));
    }

    return oauth2Client;
};

export const getAuthUrl = () => {
    if (!oauth2Client) throw new Error("OAuth2Client not initialized");
    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent",
    });
};

export const setCredentialsFromCode = async (code) => {
    if (!oauth2Client) await loadOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    return tokens;
};

export const logout = () => {
    if (fsSync.existsSync(TOKEN_PATH)) {
        fsSync.unlinkSync(TOKEN_PATH);
        oauth2Client = null;
        return true;
    }
    return false;
};
