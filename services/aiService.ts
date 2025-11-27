
import { GoogleGenAI, Type } from "@google/genai";
import { File, ClarificationRequest, ProjectConfig } from '../types';

// Initialize Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

export type GenerationResult = 
  | { type: 'code'; files: File[] }
  | { type: 'clarification'; request: ClarificationRequest };

export interface GenerationContext {
  config: ProjectConfig;
  hasClarified?: boolean;
  currentFiles?: File[];
  clarificationAnswer?: string;
}

const fileSchema = {
  type: Type.OBJECT,
  properties: {
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          language: { type: Type.STRING },
          content: { type: Type.STRING },
        },
        required: ["name", "language", "content"],
      },
    },
  },
};

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  
  // Remove markdown code block syntax if present
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Find the outer-most JSON object
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  } else {
    // If no braces found, return original to let JSON.parse fail with a useful error or try parsing as is
    return text;
  }
  
  return clean;
};

export const aiService = {
  
  generateStep: async (stepId: number, context: GenerationContext): Promise<GenerationResult> => {
    
    const { config, currentFiles, clarificationAnswer } = context;
    const featuresList = config.features.length > 0 ? config.features.join(', ') : "features implied by the description";

    // Step 5: Logic Implementation with Ambiguity Check
    if (stepId === 5 && !context.hasClarified) {
      try {
        const ambiguityResponse = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `You are a Senior Lead Engineer analyzing a request to build: "${config.name} - ${config.description}".
            Features context: ${featuresList}.
            Review the requirements and current progress. 
            Identify ONE critical ambiguity or missing detail that prevents you from writing perfect code (e.g., state persistence preference, undefined API behavior).
            Return a JSON object with a 'question' field. If everything is clear, return null or an empty object.
            Return PURE JSON.`,
            config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                question: { type: Type.STRING, nullable: true }
                }
            }
            }
        });
      
        const text = cleanJson(ambiguityResponse.text || "{}");
        const result = JSON.parse(text);
        if (result && result.question) {
            return {
            type: 'clarification',
            request: {
                fromAgentId: '4', // Spark (Engineer)
                toAgentId: '2',   // Nexus (Architect)
                question: result.question
            }
            };
        }
      } catch (e) {
          console.warn("Failed to parse ambiguity check, proceeding with generation.", e);
      }
    }

    // Construct the prompt based on the step
    let systemInstruction = "";
    let userMessage = "";
    
    // Context string from previous files
    const fileContext = currentFiles 
      ? `Current Project Files:\n${currentFiles.map(f => `--- ${f.name} ---\n${f.content}`).join('\n\n')}`
      : "";

    switch (stepId) {
      case 1: // Requirements
        systemInstruction = "You are a Technical Product Manager (Atlas).";
        userMessage = `Analyze this app request: 
        Name: ${config.name}
        Description: ${config.description}
        Theme: ${config.theme}
        Key Features: ${featuresList}

        Generate a professional README.md that outlines the features, tech stack (Vanilla JS + Tailwind CSS), and project structure. 
        
        Return a JSON object with a "files" array containing the README.md.
        Return PURE JSON. Do not wrap in markdown blocks.`;
        break;

      case 3: // Design (CSS)
        systemInstruction = "You are a UI/UX Designer (Pixel).";
        userMessage = `Create a 'style.css' for this app.
        Theme: ${config.theme} (Strictly adhere to this style).
        Description: ${config.description}
        
        - Use modern CSS variables.
        - Implement a clean, responsive design.
        - Ensure it works well with Tailwind CSS utility classes.
        ${fileContext}
        
        Return a JSON object with a "files" array containing style.css.
        Return PURE JSON. Do not wrap in markdown blocks.`;
        break;

      case 4: // Scaffolding (HTML)
        systemInstruction = "You are a Frontend Architect.";
        userMessage = `Create 'index.html' for this app.
        Name: ${config.name}
        Theme: ${config.theme}
        
        - Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
        - Link the local 'style.css'.
        - Link the local 'app.js' at the end of body.
        - Use Semantic HTML5.
        - Ensure responsive layout (mobile-first).
        - Implement the UI structure to support: ${featuresList}.
        - Ensure all IDs and classes required for JS logic are present.
        ${fileContext}
        
        Return a JSON object with a "files" array containing index.html.
        Return PURE JSON. Do not wrap in markdown blocks.`;
        break;

      case 5: // Logic (JS)
        systemInstruction = "You are a Senior Software Engineer (Spark).";
        
        let extraContext = "";
        if (clarificationAnswer) {
            extraContext = `\nCLARIFICATION FROM ARCHITECT: "${clarificationAnswer}". Use this to guide your implementation.\n`;
        }

        userMessage = `Write 'app.js' for this app.
        Features to implement: ${featuresList}
        ${extraContext}
        
        CRITICAL REQUIREMENTS:
        - Implement robust state management.
        - MANDATORY: Integrate 'localStorage' for data persistence.
          1. Load data from localStorage on startup.
          2. Save data to localStorage on every state change (add, edit, delete).
        - Wrap all initialization in 'document.addEventListener("DOMContentLoaded", ...)' to ensure DOM is ready.
        - Handle edge cases (empty state, invalid input).
        
        Context: The HTML structure is already defined in index.html.
        ${fileContext}
        
        Return a JSON object with a "files" array containing app.js.
        Return PURE JSON. Do not wrap in markdown blocks.`;
        break;

      default:
        return { type: 'code', files: [] };
    }

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: userMessage,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: fileSchema,
        },
      });

      const cleanText = cleanJson(response.text || "{}");
      const output = JSON.parse(cleanText);
      return { type: 'code', files: output.files || [] };
    } catch (e) {
      console.error("Failed to parse AI response. Raw text:", e);
      return { type: 'code', files: [] };
    }
  },

  getClarificationAnswer: async (request: ClarificationRequest, config: ProjectConfig): Promise<string> => {
     const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `You are Nexus, a Software Architect. 
        The Lead Engineer asked: "${request.question}".
        The Project Goal is: "${config.name}: ${config.description}".
        Provide a decisive, technical answer to resolve the ambiguity. Keep it under 30 words.`,
     });
     
     return response.text || "Proceed with standard best practices.";
  },

  refineCode: async (currentFiles: File[], instruction: string, config: ProjectConfig): Promise<File[]> => {
    const fileContext = currentFiles.map(f => `--- ${f.name} ---\n${f.content}`).join('\n\n');
    
    const systemInstruction = "You are a Senior Full Stack Developer tasking with refining an existing codebase based on user feedback.";
    const userMessage = `
    Project: ${config.name}
    Description: ${config.description}
    Theme: ${config.theme}
    
    Current Files:
    ${fileContext}
    
    User Refinement Instruction: "${instruction}"
    
    DIRECTIVE:
    - Analyze the request. 
    - Modify the existing files or create new ones to satisfy the request.
    - Ensure consistency with the existing theme and structure.
    - Return a JSON object with a "files" array containing ONLY the files that need to be updated.
    - You MUST return the FULL CONTENT of any file you modify. Do not use diffs or placeholders.
    - Return PURE JSON. Do not wrap in markdown blocks.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: userMessage,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: fileSchema,
        },
      });

      const cleanText = cleanJson(response.text || "{}");
      const output = JSON.parse(cleanText);
      return output.files || [];
    } catch (e) {
      console.error("Failed to parse Refine response", e);
      return [];
    }
  }
};
