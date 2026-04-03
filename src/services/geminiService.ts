import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export interface ResumeAnalysis {
  atsScore: number;
  strengths: { name: string; score: number }[];
  weaknesses: { name: string; score: number }[];
  jobRoles: string[];
  improvements: string[];
  summary: string;
  skillsFound: string[];
}

export interface ResumeComparison {
  resume1: ResumeAnalysis;
  resume2: ResumeAnalysis;
  comparisonSummary: string;
  keyDifferences: string[];
  similarities: string[];
  winner: 1 | 2 | "tie";
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following resume text and provide a detailed assessment in JSON format.
    
    Resume Text:
    ${resumeText}
    
    The JSON should follow this structure:
    {
      "atsScore": number (0-100),
      "strengths": Array<{ name: string, score: number (0-100) }>,
      "weaknesses": Array<{ name: string, score: number (0-100) }>,
      "jobRoles": Array<string>,
      "improvements": Array<string>,
      "summary": string,
      "skillsFound": Array<string>
    }
    
    Focus on:
    - ATS compatibility (keywords, formatting, clarity).
    - Identifying core skills and experience levels.
    - Suggesting relevant job titles.
    - Providing actionable improvement tips.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          atsScore: { type: Type.NUMBER },
          strengths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["name", "score"]
            }
          },
          weaknesses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER }
              },
              required: ["name", "score"]
            }
          },
          jobRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          skillsFound: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["atsScore", "strengths", "weaknesses", "jobRoles", "improvements", "summary", "skillsFound"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to analyze resume. Please try again.");
  }
}

export async function compareResumes(text1: string, text2: string): Promise<ResumeComparison> {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Compare the following two resumes and provide a detailed side-by-side assessment in JSON format.
    
    Resume 1:
    ${text1}
    
    Resume 2:
    ${text2}
    
    The JSON should follow this structure:
    {
      "resume1": { /* same structure as ResumeAnalysis */ },
      "resume2": { /* same structure as ResumeAnalysis */ },
      "comparisonSummary": string,
      "keyDifferences": Array<string>,
      "similarities": Array<string>,
      "winner": 1 | 2 | "tie"
    }
    
    Focus on:
    - Side-by-side ATS score comparison.
    - Skill profile differences.
    - Experience level comparison.
    - Which resume is better suited for general high-tier roles.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resume1: {
            type: Type.OBJECT,
            properties: {
              atsScore: { type: Type.NUMBER },
              strengths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, score: { type: Type.NUMBER } } } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, score: { type: Type.NUMBER } } } },
              jobRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              skillsFound: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["atsScore", "strengths", "weaknesses", "jobRoles", "improvements", "summary", "skillsFound"]
          },
          resume2: {
            type: Type.OBJECT,
            properties: {
              atsScore: { type: Type.NUMBER },
              strengths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, score: { type: Type.NUMBER } } } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, score: { type: Type.NUMBER } } } },
              jobRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              skillsFound: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["atsScore", "strengths", "weaknesses", "jobRoles", "improvements", "summary", "skillsFound"]
          },
          comparisonSummary: { type: Type.STRING },
          keyDifferences: { type: Type.ARRAY, items: { type: Type.STRING } },
          similarities: { type: Type.ARRAY, items: { type: Type.STRING } },
          winner: { type: Type.STRING, description: "1, 2, or tie" }
        },
        required: ["resume1", "resume2", "comparisonSummary", "keyDifferences", "similarities", "winner"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI comparison response", e);
    throw new Error("Failed to compare resumes. Please try again.");
  }
}
