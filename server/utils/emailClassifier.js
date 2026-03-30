import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
});

const prompt = new PromptTemplate({
  template: `
You are an intelligent email assistant.
Classify each email into a CATEGORY and assign a PRIORITY.
Return ONLY valid JSON (RFC 8259 compliant). Escape all special characters.

Email:
From: {from}
Subject: {subject}
Date: {date}
Body: {body}

Output only JSON:
{{{{  // ← outputs a single {{
  "from": "{from}",
  "subject": "{subject}",
  "body": "{body}",
  "category": "CategoryName",
  "priority": "High/Medium/Low"
}}}}
`,
  inputVariables: ["from", "subject", "date", "body"],
});


const chain = prompt.pipe(llm);

function sanitizeJSON(jsonString) {
  return jsonString
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // remove control chars
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .trim();
}

export const classifyEmails = async (emails) => {
  try {
    const results = await Promise.all(
      emails.map(async (email) => {
        const res = await chain.invoke({
          from: email.from,
          subject: email.subject,
          date: email.date,
          body: email.body,
        });

        let output =
          res?.content?.[0]?.text || res?.text || res || "";

        output = sanitizeJSON(output);

        try {
          return JSON.parse(output);
        } catch (parseErr) {
          console.error("Invalid JSON, raw output:", output);
          return {
            from: email.from,
            subject: email.subject,
            body: email.body,
            category: "Unknown",
            priority: "Low",
            error: "Failed to parse LLM output"
          };
        }
      })
    );

    return results;
  } catch (err) {
    console.error("Error classifying emails:", err);
    throw err;
  }
};
