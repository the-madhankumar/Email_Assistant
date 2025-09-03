import express from "express";
import { listTodayEmails } from "../utils/gmail.js";
import {classifyEmails}  from "../utils/emailClassifier.js";
import { chatWithEmailBot } from "../utils/chatBot.js";
import path from "path";
import fs from "fs";


const router = express.Router();

router.get("/emails/today", async (req, res) => {
    try {
        const emails = await listTodayEmails();

        console.log(emails);

        const results = await classifyEmails(emails);

        const filePath = path.join(process.cwd(), "email.json");
        fs.writeFileSync(filePath, JSON.stringify(results, null, 2), "utf-8");

        res.json({
            mail : results
        });

    } catch (error) {
        console.error("Error fetching today’s emails:", error);
        res.status(500).json({ error: "Failed to fetch emails" });
    }
});

router.post('/chat' , async(req,res)=>{

    const{question} = req.body;

    const response = await chatWithEmailBot(question);

    res.json({ answer: response });

})

export default router;
