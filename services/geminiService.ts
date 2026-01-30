
import { GoogleGenAI, Type } from "@google/genai";
import { ScanConfig, AnalysisResult } from "../types";

export async function analyzeThread(config: ScanConfig, images: string[]): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageParts = images.map((base64Data) => {
    const [header, data] = base64Data.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    return {
      inlineData: {
        data: data,
        mimeType: mimeType
      }
    };
  });

  const prompt = `
    You are a high-precision Mechanical Integrity Inspector and Metrologist. Your objective is to perform a technical audit of a thread connection using both the provided metadata and visual evidence.

    **STEP 1: TECHNICAL SPECIFICATIONS (Reference Data)**
    - Product: ${config.product || 'Not Specified'}
    - Standard: ${config.connectionStandard}
    - Gender: ${config.connectionGender}
    - Connection Type: ${config.connectionType}
    - Thread Category: ${config.threadCategory}
    - Thread Type: ${config.threadType}

    **STEP 2: VISUAL DATA**
    You are provided with ${images.length} sequential frames capturing the circumference of this connection.

    **INSPECTION REQUIREMENTS:**
    1.  **Dimensional Analysis & Classification:** From the images, automatically measure key thread dimensions (e.g., pitch, crest width, root width) in millimeters. Based on these measurements and the overall geometry, classify the thread type (e.g., "API 8-Round", "Buttress"). Provide a confidence score for your classification.
    2.  **Cross-Reference:** Evaluate if the visually identified thread form and your classification match the technical description provided in Step 1.
    3.  **Defect Detection:** Search for nicks, dents, burrs, galling (torn metal), pitting, corrosion, or debris. 
    4.  **Standard Adherence:** Determine if the condition meets the requirements of the ${config.connectionStandard} standard. DS-1 and Premium standards have zero tolerance for galling.
    5.  **Findings Mapping:** For every issue, specify exactly which Frame Index (0 to ${images.length - 1}) contains the evidence.

    **OUTPUT FORMAT (Strict JSON):**
    - A technical summary: State clearly if the connection "Conforms to Specification" or "Fails Inspection". Start with a direct statement about the ${config.product} connection.
    - A 'classification' object with 'predictedThreadType' and 'confidence' (from 0 to 1).
    - A 'dimensions' object with 'pitch_mm', 'crestWidth_mm', and 'rootWidth_mm'.
    - A list of findings: Include defect type, severity (Low/Medium/High), and a detailed technical description for each detected issue.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [
          ...imageParts,
          { text: prompt }
        ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING,
              description: "A definitive technical conclusion regarding the thread's status relative to the provided specs."
            },
            classification: {
                type: Type.OBJECT,
                properties: {
                    predictedThreadType: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                }
            },
            dimensions: {
                type: Type.OBJECT,
                properties: {
                    pitch_mm: { type: Type.NUMBER },
                    crestWidth_mm: { type: Type.NUMBER },
                    rootWidth_mm: { type: Type.NUMBER }
                }
            },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  frameIndex: { type: Type.INTEGER },
                  defectType: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
                },
                required: ["frameIndex", "defectType", "description", "severity"]
              }
            }
          },
          required: ["summary", "classification", "dimensions", "findings"]
        }
      }
    });

    const resultText = response.text || "{}";
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("The AI inspector encountered an error analyzing these specs. Please ensure images are clear and specs are accurate.");
  }
}
