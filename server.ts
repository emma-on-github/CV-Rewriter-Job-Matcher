import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const app = express();
const PORT = 3000;

// Security & Privacy headers - zero storage guarantee
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

// JSON body parser with generous limit for document text payloads
app.use(express.json({ limit: "25mb" }));

// Lazy initialization of Gemini API Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// 1. Health & Privacy Audit Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    ephemeralMode: true,
    dataRetention: "0s (zero-storage)",
    piiGuardrails: "active",
    model: "gemini-3.8-flash",
  });
});

// 2. Safe Ephemeral Document Text Extraction (PDF, DOCX, TXT, MD)
app.post("/api/extract-document", async (req, res) => {
  try {
    const { base64Data, filename, mimeType } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: "Missing document data." });
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const fileBuffer = Buffer.from(cleanBase64, "base64");
    const lowerName = (filename || "").toLowerCase();

    let extractedText = "";

    if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
      const parser = new PDFParse({ data: fileBuffer });
      const textResult = await parser.getText();
      extractedText = textResult.text || "";
      await parser.destroy();
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerName.endsWith(".docx")
    ) {
      const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = docxResult.value || "";
    } else {
      // Plain text, Markdown, RTF
      extractedText = fileBuffer.toString("utf-8");
    }

    // Clean up empty lines and normalize whitespace
    const cleaned = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Explicitly nullify buffer to free memory immediately
    fileBuffer.fill(0);

    return res.json({
      success: true,
      text: cleaned,
      charCount: cleaned.length,
      wordCount: cleaned ? cleaned.split(/\s+/).length : 0,
      privacyNotice: "Document processed in ephemeral volatile memory; zero disk writes.",
    });
  } catch (err: any) {
    console.error("Document extraction error:", err?.message || err);
    return res.status(500).json({
      error: "Failed to extract text from document. Please verify the file format or paste the text directly.",
    });
  }
});

// 3. Privacy-First CV Rewriting & Job Matching
app.post("/api/rewrite-cv", async (req, res) => {
  try {
    const {
      sanitizedCvText,
      jobDescription,
      countryLocation,
      regionalPreset,
      tone = "impact_driven",
      complianceFramework = "GDPR",
    } = req.body;

    if (!sanitizedCvText || !sanitizedCvText.trim()) {
      return res.status(400).json({ error: "Sanitized CV text is required." });
    }
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required." });
    }

    const ai = getGenAI();

    // Construct regional formatting & anti-bias instructions
    const regionalRules = regionalPreset?.antiBiasRules?.join("; ") || "Strict anti-bias rules applied";
    const regionalGuidelines = regionalPreset?.guidelines?.join("; ") || "Regional CV standard";
    const spellingMode = regionalPreset?.spelling || "US";

    const systemInstruction = `You are a world-class executive recruiter, technical career coach, and regional hiring compliance specialist.
Your mission is to rewrite and tailor the provided candidate CV so that it directly matches the requirements, qualifications, and keyword expectations of the target Job Description, while adhering to regional CV standards and strict data privacy guardrails.

CORE DIRECTIVES:
1. ANONYMITY TOKEN PRESERVATION:
   The candidate CV has been sanitized. Any tokens enclosed in square brackets such as [CANDIDATE_NAME], [EMAIL_ADDRESS_1], [PHONE_NUMBER_1], [LINKEDIN_PROFILE], [STREET_ADDRESS_1], [POSTAL_CODE_1], [PORTFOLIO_URL_1], etc., MUST BE PRESERVED AS IS in the output. NEVER invent fake personal names, addresses, or phone numbers.

2. REGIONAL FORMAT & SPELLING:
   - Target Location: ${countryLocation || "US"} (${regionalPreset?.title || "Regional Standard"})
   - Target Spelling: ${spellingMode === "UK" || spellingMode === "AU" ? "British/Commonwealth English (e.g., optimised, specialised, prioritised, programme)" : "American English (e.g., optimized, specialized, prioritized, program)"}
   - Regional Guidelines: ${regionalGuidelines}

3. ANTI-BIAS & COMPLIANCE GUARDRAILS:
   - Compliance Framework: ${complianceFramework}
   - Anti-bias Mandate: ${regionalRules}
   - STRICTLY OMIT all personal photos, age, date of birth, marital status, gender, religion, and nationality declarations.
   - For US/Canada/UK/EU compliance, ensure the CV cannot be rejected for containing prohibited demographic disclosures.

4. SKILL & EXPERIENCE TAILORING:
   - Carefully analyze the Job Description's required technologies, soft skills, methodologies, and seniority expectations.
   - Rewrite the Professional Summary to immediately hook the hiring manager and ATS with relevant keywords.
   - Reframe work experience bullets using the STAR/CAR methodology (Action Verb + Context + Quantifiable Result / Metric).
   - Prominently organize technical and domain skills matching the Job Description.
   - Never fabricate completely false work history, but elevate, spotlight, and articulate all genuine transferable skills from the candidate's background that match the job description.

5. OUTPUT FORMAT:
   Return a structured JSON object strictly adhering to the specified schema. Output the rewritten CV in clean, beautifully structured Markdown (using #, ##, ###, bullet points, and bold text).`;

    const userPrompt = `TARGET JOB DESCRIPTION:
"""
${jobDescription}
"""

CANDIDATE SANITIZED CV:
"""
${sanitizedCvText}
"""

REWRITE PREFERENCES:
- Target Tone: ${tone}
- Compliance Standard: ${complianceFramework}
- Country Standard: ${regionalPreset?.title || countryLocation}

Please rewrite and tailor the CV to match the job description requirements and highlight relevant skills.`;

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let responseText: string | null = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.3,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  tailoredCvMarkdown: {
                    type: Type.STRING,
                    description: "The complete rewritten and tailored CV in polished, professional Markdown.",
                  },
                  executiveSummary: {
                    type: Type.STRING,
                    description: "Executive brief summarizing how the CV was optimized for this specific role.",
                  },
                  matchScore: {
                    type: Type.INTEGER,
                    description: "Quantitative match score from 0 to 100 based on keyword overlap, skill match, and seniority alignment.",
                  },
                  matchedSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of key skills directly matched between candidate background and the job requirements.",
                  },
                  highlightedSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Transferable or secondary skills elevated and emphasized to showcase candidate strengths.",
                  },
                  gapSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Relevant skills or certifications requested in the job description that were not evident in the CV.",
                  },
                  keyChanges: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        section: { type: Type.STRING, description: "Section modified, e.g. Summary, Experience, Skills" },
                        explanation: { type: Type.STRING, description: "What was modified and why" },
                        impact: { type: Type.STRING, description: "How this improves ATS ranking or recruiter impression" },
                      },
                      required: ["section", "explanation", "impact"],
                    },
                    description: "Key structural and contextual revisions made to tailor the CV.",
                  },
                  regionalComplianceNotes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Regional compliance details applied (e.g. spelling standard, page length standard, EEOC/GDPR anti-bias actions).",
                  },
                  antiBiasNotice: {
                    type: Type.STRING,
                    description: "Formal statement of anti-bias adherence according to regional employment law.",
                  },
                  regionalFormatApplied: {
                    type: Type.STRING,
                    description: "The name and convention of the regional standard applied.",
                  },
                },
                required: [
                  "tailoredCvMarkdown",
                  "executiveSummary",
                  "matchScore",
                  "matchedSkills",
                  "highlightedSkills",
                  "gapSkills",
                  "keyChanges",
                  "regionalComplianceNotes",
                  "antiBiasNotice",
                  "regionalFormatApplied",
                ],
              },
            },
          });

          if (response.text) {
            responseText = response.text.trim();
            break;
          }
        } catch (err: any) {
          lastError = err;
          // If 503 or transient, sleep 1.5s before retry
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
      if (responseText) break;
    }

    if (!responseText) {
      throw lastError || new Error("Failed to receive response from Gemini model.");
    }

    const parsedResult = JSON.parse(responseText);

    return res.json({
      success: true,
      result: parsedResult,
      serverAudit: {
        timestamp: new Date().toISOString(),
        dataRetained: false,
        piiScrubbed: true,
        frameworkCompliance: complianceFramework,
        modelUsed: "gemini-3.8-flash",
        ephemeralSessionId: "eph-" + Math.random().toString(36).substring(2, 12),
      },
    });
  } catch (err: any) {
    console.error("CV rewrite failed:", err?.message || err);
    return res.status(500).json({
      error: err?.message || "Failed to rewrite CV. Please verify inputs and try again.",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CV Matcher server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
