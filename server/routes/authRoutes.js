import express from "express";
import { loadOAuth2Client, getAuthUrl, setCredentialsFromCode, logout } from "../utils/oauth.js";
import { getUserEmail } from "../utils/gmail.js";

const router = express.Router();

router.get('/login', async (req, res) => {
    try {
        await loadOAuth2Client();
        const url = getAuthUrl();
        res.redirect(url);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Failed to generate login URL');
    }
});

router.get("/oauth2callback", async (req, res) => {
    const { code } = req.query;
    try {
        await setCredentialsFromCode(code);
        res.redirect("http://localhost:3000/home");
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect("http://localhost:3000/?error=auth_failed");
    }
});

router.get("/me", async (req, res) => {
    const email = await getUserEmail();
    res.json({ email });
});

router.post("/logout", (req, res) => {
    const success = logout();
    res.json({ success });
});

export default router;
