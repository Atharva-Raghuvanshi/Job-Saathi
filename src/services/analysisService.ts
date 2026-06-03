import { TECH_SKILLS, JOB_ROLES, RESUME_SECTIONS } from './techData';

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

/**
 * Local analysis engine for tech resumes.
 * This system uses a comprehensive local dataset of technical skills,
 * job roles, and resume best practices to provide insights.
 * 
 * No external AI APIs or services are used.
 */
export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  // Simulate a brief processing period for a better user experience
  await new Promise(resolve => setTimeout(resolve, 1200));

  const text = resumeText.toLowerCase();
  const foundSkills: string[] = [];
  
  // 1. Extract skills from our large local dataset
  Object.values(TECH_SKILLS).flat().forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  // 2. Check for standard resume sections
  const foundSections = RESUME_SECTIONS.filter(section => 
    text.includes(section.toLowerCase())
  );

  // 3. Calculate ATS Score based on local heuristics
  // - Skill density (up to 50 points)
  // - Section completeness (up to 30 points)
  // - Formatting/Length (up to 20 points)
  const skillScore = Math.min(foundSkills.length * 4, 50); 
  const sectionScore = (foundSections.length / RESUME_SECTIONS.length) * 30;
  const lengthScore = Math.min((resumeText.length / 1500) * 20, 20);
  
  const atsScore = Math.round(skillScore + sectionScore + lengthScore);

  // 4. Identify Strengths (top skills found)
  const strengths = foundSkills.slice(0, 6).map(skill => ({
    name: skill,
    score: 80 + Math.floor(Math.random() * 15)
  }));

  // 5. Identify High-Value Target Acquisitions (Advanced Databases, AI/ML features, and Blockchain)
  const premiumGrowthPool = [
    "PostgreSQL", "MongoDB", "Redis", "Supabase", "SurrealDB", "ClickHouse", "Cassandra", 
    "Google Cloud Spanner", "Amazon Aurora", "Databricks", "Delta Lake", "Apache Iceberg",
    "Pinecone", "Milvus", "ChromaDB", "Weaviate", "Qdrant", "pgvector", "Faiss", "Feast Feature Store",
    "Generative AI", "LLMs", "RAG (Retrieval-Augmented Generation)", "Prompt Engineering", 
    "Fine-Tuning", "LangChain", "LlamaIndex", "Hugging Face", "MLOps", "Vector Search", "Deep Learning",
    "Solidity", "Smart Contracts", "DeFi (Decentralized Finance)", "DApps", "Cryptography", "IPFS", "BigchainDB"
  ];

  const missingSkills = premiumGrowthPool
    .filter(skill => !foundSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase()))
    .sort(() => 0.5 - Math.random()) // Randomize missing skills for variety
    .slice(0, 4);
  
  const weaknesses = missingSkills.map(skill => ({
    name: skill,
    score: 65 + Math.floor(Math.random() * 25) // Higher score represents target adoption opportunity level
  }));

  // 6. Suggest Job Roles based on keyword matching
  const suggestedRoles = JOB_ROLES.filter(role => 
    role.keywords.some(kw => text.includes(kw.toLowerCase()))
  ).map(role => role.title);

  if (suggestedRoles.length === 0) suggestedRoles.push("Software Engineer");

  // 7. Actionable Improvements
  const improvements = [];
  if (!text.includes("projects")) improvements.push("Consider adding a 'Projects' section to demonstrate practical application of your skills.");
  if (foundSkills.length < 10) improvements.push("Your technical keyword density is a bit low. Try to explicitly list more of the tools and technologies you've used.");
  if (!text.includes("education")) improvements.push("Ensure your educational background is clearly visible to recruiters.");
  if (resumeText.length < 800) improvements.push("Your resume is a bit brief. Try to elaborate more on your specific contributions in each role.");
  if (foundSections.length < 5) improvements.push("Standard sections like 'Summary' or 'Certifications' could help give a more complete picture of your profile.");

  return {
    atsScore,
    strengths,
    weaknesses,
    jobRoles: suggestedRoles.slice(0, 4),
    improvements: improvements.slice(0, 5),
    summary: `Our local analysis engine identified ${foundSkills.length} technical keywords and ${foundSections.length} key resume sections. This profile shows a ${atsScore >= 75 ? 'strong' : 'solid'} foundation in ${foundSkills.slice(0, 3).join(', ')}.`,
    skillsFound: foundSkills
  };
}

export async function compareResumes(text1: string, text2: string): Promise<ResumeComparison> {
  const analysis1 = await analyzeResume(text1);
  const analysis2 = await analyzeResume(text2);

  const similarities = analysis1.skillsFound.filter(skill => 
    analysis2.skillsFound.includes(skill)
  );

  const diff1 = analysis1.skillsFound.filter(skill => !analysis2.skillsFound.includes(skill));
  const diff2 = analysis2.skillsFound.filter(skill => !analysis1.skillsFound.includes(skill));

  let winner: 1 | 2 | "tie" = "tie";
  if (analysis1.atsScore > analysis2.atsScore + 5) winner = 1;
  else if (analysis2.atsScore > analysis1.atsScore + 5) winner = 2;

  return {
    resume1: analysis1,
    resume2: analysis2,
    comparisonSummary: `Resume 1 focuses more on ${diff1.slice(0, 2).join(', ')} while Resume 2 highlights ${diff2.slice(0, 2).join(', ')}. Both share a background in ${similarities.slice(0, 2).join(', ')}.`,
    keyDifferences: [
      `Resume 1 has ${analysis1.skillsFound.length} technical keywords vs Resume 2's ${analysis2.skillsFound.length}.`,
      winner === "tie" ? "Both resumes are quite competitive." : `Resume ${winner} shows a slightly more comprehensive skill profile.`
    ],
    similarities: similarities.slice(0, 5),
    winner
  };
}
