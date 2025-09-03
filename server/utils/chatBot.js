import fs from "fs";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";


const emailData = JSON.parse(fs.readFileSync("email.json", "utf-8"));


const emailText = emailData.map((email, i) => {
  return `Email ${i + 1}:
From: ${email.from}
To: ${email.to}
Subject: ${email.subject}
Body: ${email.body}`;
}).join("\n\n");


const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile", 
  temperature: 0.2
});


const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful and polite email assistant.  
You have access ONLY to the following emails:  

{emails}

When answering the user's question:  
Use ONLY the information contained in the given emails.  
If the answer is not directly available, do NOT say that information is missing or the body is unclear.  
Instead, politely say something like:  
"Thank you for your question! Could you please ask something related to the emails I have?"  
Always respond in a positive and respectful manner.  
Summarize or paraphrase the information from the emails when answering, even if details are limited.

User's question: {question}  
Answer:`);


const chain = prompt.pipe(llm);


export const chatWithEmailBot = async (question) => {
  const response = await chain.invoke({
    emails: emailText,
    question,
  });
  
  return response.text;
}


