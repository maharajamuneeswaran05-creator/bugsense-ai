import express from "express";
import path from "path";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Firebase Admin
let adminApp: admin.app.App | null = null;
function getFirebaseAdmin() {
  if (!adminApp) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return null;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (e) {
      console.error("Failed to initialize Firebase Admin:", e);
      return null;
    }
  }
  return adminApp;
}

// Lazy initialize Gemini client inside endpoints or functions to avoid module-load crashes
let aiInstance: GoogleGenAI | null = null;

// Status endpoint to check if API key is supplied
app.get("/api/status", (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const isOk = !!key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "";
  res.json({ configured: isOk });
});

function getGeminiClient() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Resilient GenAI Content Generation wrapper with automated retries and fallback models
async function callGeminiWithRetryAndFallback(
  ai: GoogleGenAI,
  modelPrompt: string,
  systemInstruction: string,
  responseSchema: any
) {
  // Ordered sequence of robust models to attempt.
  // Primary is gemini-3.5-flash. Fallbacks are model aliases and compatible lite versions.
  const models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    const attempts = 3;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`[BugSense AI] Calling content generation on model "${model}" (attempt ${attempt}/${attempts})...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: modelPrompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });
        
        if (response && response.text) {
          console.log(`[BugSense AI] Successfully generated text using model "${model}".`);
          return response;
        }
        throw new Error("Empty response returned from model.");
      } catch (err: any) {
        lastError = err;
        console.warn(`[BugSense AI] Warn: Error calling model "${model}" (attempt ${attempt}/${attempts}):`, err.message || err);
        
        const errorMessage = String(err.message || "").toLowerCase();
        const errorStatus = String(err.status || "").toUpperCase();
        
        // Match standard rate limits, model overloads, or unavailable downstream errors (such as 503 errors)
        const isTransient = 
          errorStatus === "UNAVAILABLE" || 
          errorStatus === "RESOURCE_EXHAUSTED" || 
          errorMessage.includes("503") || 
          errorMessage.includes("429") || 
          errorMessage.includes("unavailable") || 
          errorMessage.includes("demand") || 
          errorMessage.includes("spike") || 
          errorMessage.includes("temporary");
          
        if (isTransient && attempt < attempts) {
          const delay = attempt * 1200;
          console.log(`[BugSense AI] Retrying in ${delay}ms due to transient upstream unavailability...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Break the retry loop for non-transient issues or when max attempts are depleted
          break;
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after applying all retry and model-fallback options.");
}

// REST API endpoint for debugging reports
app.post("/api/debug", async (req, res) => {
  try {
    const { bug_report, logs, code_context, extra_context } = req.body;

    if (!bug_report) {
      return res.status(400).json({ error: "Bug report input is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are BugSense AI, an expert software debugging assistant specializing in developer intelligence, system diagnostics, and QA.
Your job is to convert vague, short, or confusing bug reports into crystal-clear reproduction steps, highly detailed technical root cause analysis, and production-ready, actionable fix suggestions.

Think like:
- A senior systems/software developer (expert root cause, highlighting dangerous/risky areas in code and suggesting robust prevention best practices with extreme confidence)
- A QA engineer (reproducibility steps, test design, verification checklist)
- A systems debugger (log examination, identifying common similar industry bug patterns)

Adhere strictly to these rules:
- Be extremely specific, detailed, and realistic. Never give lazy or generic advice like "check your configuration".
- Assume a modern web-oriented application if logs or context details are thin.
- Prioritize realistic, accurate debugging hypotheses based on the provided logs and patterns.
- Do not make up mock frameworks (e.g., utilize standard names like React, Express, Vue, Node.js, Vite, Webpack, PostgreSQL, etc. only).
- Keep everything structured, clean, and highly professional.`;

    const modelPrompt = `Analyze the following bug reporting elements and generate the debugging schema:

### BUG REPORT INPUT:
${bug_report}

### LOGS / STACK TRACES:
${logs || "No logs provided."}

### CODE CONTEXT:
${code_context || "No code context file or snippets provided."}

${extra_context ? `### ADDITIONAL DEEP-DIVE INVESTIGATION CONTEXT / RE-RUN GUIDELINES:
${extra_context}` : ""}

Please analyze these elements step-by-step and return the resulting analysis in strict JSON form according to the specified schema constraints.`;

    const response = await callGeminiWithRetryAndFallback(
      ai,
      modelPrompt,
      systemInstruction,
      {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A highly descriptive, technical title summarizing the reported issue"
          },
          severity: {
            type: Type.STRING,
            description: "Assess severity: Low, Medium, High, or Critical based on input context",
          },
          reproduction_steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Precise, bulletproof multi-step instructions for QA or developers to reproduce the exact issue"
          },
          root_cause: {
            type: Type.STRING,
            description: "Deep technical root cause analysis explaining why the error occurred, referencing logs or code patterns context"
          },
          fix_suggestion: {
            type: Type.STRING,
            description: "Actionable, precise explanation detailing exactly how to correct the bug, state changes, etc."
          },
          fix_code: {
            type: Type.STRING,
            description: "Complete, properly syntax-highlightable markdown code snippet or before/after comparison showing the exact code fixes"
          },
          affected_components: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Core modules, files, or subsystems that are likely affected or involved (e.g. 'Authentication Controller', 'State Reducer')"
          },
          qa_checklist: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Concrete verification test cases or checks the QA engineer must review to mark this ticket as verified"
          },
          confidence_score: {
            type: Type.STRING,
            description: "Confidence in analysis: High, Medium, or Low"
          },
          similar_patterns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Brief explanations or names of similar industry bug patterns or anti-patterns detected"
          },
          risky_areas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lines or blocks of code with structural risks, security implications, or potential memory/resource leaks"
          },
          prevention_practices: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Proactive prevention instructions and best practices to ensure this flaw does not reappear"
          },
          test_generator: {
            type: Type.OBJECT,
            description: "Automated test case generations including unit test assertions, integration steps, and key boundary conditions",
            properties: {
              unit_test: {
                type: Type.STRING,
                description: "Runnable, clean, and well-commented unit test case code utilizing realistic frameworks (such as Jest for JavaScript/TypeScript, PyTest for Python, JUnit, Mocha, etc.) with precise mock setup, assertions, and descriptions of expected outputs."
              },
              integration_test: {
                type: Type.STRING,
                description: "Chronological, detailed integration test scenarios and verification steps checking interaction across multiple subsystems or services."
              },
              edge_cases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Advanced boundary, null value, error condition, performance load, or asynchronous race-condition edge cases to check."
              }
            },
            required: ["unit_test", "integration_test", "edge_cases"]
          },
          flow_diagram: {
            type: Type.OBJECT,
            description: "Interactive system flow representation identifying sequence from user interaction to failure node.",
            properties: {
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Step-by-step sequential flow tracing UI → API → Backend → Database → Error point. Mark the final error step with red color/cross symbols (e.g. 'Step 3: Backend Database Query -> ❌ Connection Timeout')"
              },
              failure_point: {
                type: Type.STRING,
                description: "Clear and human-readable highlighting of exactly where the failure occurs in this flow."
              }
            },
            required: ["steps", "failure_point"]
          },
          classification: {
            type: Type.OBJECT,
            description: "Calculated enterprise-grade production classification of the issue based on system stability metrics.",
            properties: {
              severity: {
                type: Type.STRING,
                description: "Must be exactly Low, Medium, High, or Critical."
              },
              priority: {
                type: Type.STRING,
                description: "Must be exactly P1, P2, or P3."
              },
              impact: {
                type: Type.STRING,
                description: "Empathetic and realistic overview explaining how many users, roles, or key features have been degraded or brought down."
              },
              reason: {
                type: Type.STRING,
                description: "Why this bug warrants this exact severity/priority pairing rather than a lesser or higher one."
              }
            },
            required: ["severity", "priority", "impact", "reason"]
          },
          senior_explanation: {
            type: Type.STRING,
            description: "A kind, friendly mentoring session explanation of the bug. Formatted from a Senior Lead directly to a Junior programmer. Keeps it exceptionally clean, insightful, relatable, non-jargony, and actionable."
          },
          user_friendly_report: {
            type: Type.STRING,
            description: "An exceptionally clear, human-readable, and comprehensive text-based report designed for end-users, clients, product managers, and non-developers. Formatted with clean whitespace, markdown lists, or bold text. It must explain: 1. A friendly summary of what broke in basic non-technical terms, 2. Who is affected and how this degrades daily experience, 3. Practical workarounds or suggestions they can perform immediately, and 4. A comforting assurance explaining that our technical team now has a full diagnostic report they need to deploy a quick fix."
          }
        },
        required: [
          "title",
          "severity",
          "reproduction_steps",
          "root_cause",
          "fix_suggestion",
          "fix_code",
          "affected_components",
          "qa_checklist",
          "confidence_score",
          "similar_patterns",
          "risky_areas",
          "prevention_practices",
          "test_generator",
          "flow_diagram",
          "classification",
          "senior_explanation",
          "user_friendly_report"
        ]
      }
    );

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Empty response received from Gemini.");
    }

    const parsedData = JSON.parse(textResponse.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("BugSense AI Debug Endpoint Error:", error);
    return res.status(500).json({
      error: error.message || "An unexpected error occurred while debugging."
    });
  }
});

// Configure Vite middleware in development vs static hosting in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode serving built static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running at http://localhost:${PORT}`);
  });
}

startServer();
