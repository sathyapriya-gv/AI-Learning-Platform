const { GoogleGenerativeAI } = require("@google/generative-ai");

// ============================================================
// GEMINI INITIALIZATION
// ============================================================

let genAI = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}


// ============================================================
// GEMINI MODELS
// ============================================================
//
// We use multiple models so that if one model is temporarily busy,
// the application automatically tries another model.
//

const GEMINI_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite"
];


// ============================================================
// HELPER: WAIT
// ============================================================

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


// ============================================================
// GEMINI REQUEST WITH MODEL FALLBACK
// ============================================================

async function generateWithGemini(prompt, jsonMode = true) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);

      const generationConfig = {};

      if (jsonMode) {
        generationConfig.responseMimeType = "application/json";
      }

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig
      });

      const result = await model.generateContent(prompt);

      const responseText = result.response.text();

      if (!responseText) {
        throw new Error(
          `${modelName} returned an empty response.`
        );
      }

      console.log(
        `Gemini model ${modelName} responded successfully.`
      );

      return responseText;

    } catch (error) {
      lastError = error;

      const status = error.status || error.statusCode;

      console.error(
        `Gemini model ${modelName} failed:`,
        error.message
      );

      // --------------------------------------------------------
      // If the model is temporarily overloaded (503),
      // wait briefly and try the next model.
      // --------------------------------------------------------

      if (status === 503) {
        console.log(
          `${modelName} is temporarily unavailable. Trying another Gemini model...`
        );

        await wait(1000);

        continue;
      }

      // --------------------------------------------------------
      // Rate limit
      // --------------------------------------------------------

      if (status === 429) {
        console.log(
          `${modelName} rate limit reached. Trying another Gemini model...`
        );

        await wait(1500);

        continue;
      }

      // --------------------------------------------------------
      // Model unavailable / not found
      // --------------------------------------------------------

      if (status === 404) {
        console.log(
          `${modelName} is unavailable. Trying another Gemini model...`
        );

        continue;
      }

      // --------------------------------------------------------
      // For other errors, also try next model.
      // --------------------------------------------------------

      continue;
    }
  }

  throw new Error(
    `All Gemini models failed. Last error: ${
      lastError ? lastError.message : "Unknown error"
    }`
  );
}


// ============================================================
// IDENTIFY TOPICS
// ============================================================

async function identifyTopics(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return [];
  }

  const sourceText = text.substring(0, 10000);

  const prompt = `
You are an expert educational content analyzer.

Read the following learning material and identify the important academic
topics and concepts contained in it.

IMPORTANT RULES:

1. Identify meaningful concepts, not random words.
2. Do not create topics from individual words.
3. Preserve technical terminology.
4. If the text contains OCR mistakes, infer the correct technical term
   from the surrounding context.
5. Return only topics actually supported by the material.
6. Focus on concepts useful for examination preparation.

For example, if the material is about Object-Oriented Programming,
useful topics could include:

- Classes and Objects
- Encapsulation
- Abstraction
- Inheritance
- Polymorphism
- Method Overloading
- Method Overriding

Do NOT return topics such as:

- Object
- Programming
- Oriented

Return ONLY valid JSON:

{
  "topics": [
    "Topic 1",
    "Topic 2",
    "Topic 3"
  ]
}

Learning material:

${sourceText}
`;

  // ----------------------------------------------------------
  // GEMINI
  // ----------------------------------------------------------

  if (genAI) {
    try {
      const responseText = await generateWithGemini(
        prompt,
        true
      );

      const parsed = JSON.parse(responseText);

      if (Array.isArray(parsed.topics)) {
        return parsed.topics;
      }

      console.log(
        "Gemini topic response did not contain a topics array."
      );

    } catch (error) {
      console.error(
        "Gemini topic identification failed:",
        error.message
      );
    }
  }

  // ----------------------------------------------------------
  // LOCAL FALLBACK
  // ----------------------------------------------------------

  console.log(
    "Using local topic identification fallback."
  );

  return localTopicIdentifier(sourceText);
}


// ============================================================
// GENERATE QUIZ
// ============================================================

async function generateQuiz(
  text,
  questionTypes,
  numQuestions,
  difficulty
) {
  // ----------------------------------------------------------
  // BASIC VALIDATION
  // ----------------------------------------------------------

  if (
    !text ||
    typeof text !== "string" ||
    !text.trim()
  ) {
    throw new Error(
      "No learning material was provided."
    );
  }

  const count = Number(numQuestions) || 5;

  const level = [
    "easy",
    "medium",
    "hard"
  ].includes(
    String(difficulty).toLowerCase()
  )
    ? String(difficulty).toLowerCase()
    : "medium";

  const types =
    Array.isArray(questionTypes) &&
    questionTypes.length > 0
      ? questionTypes
      : ["mcq"];

  // ----------------------------------------------------------
  // LIMIT SOURCE TEXT
  // ----------------------------------------------------------

  const sourceText = text.substring(0, 12000);

  // ==========================================================
  // QUIZ PROMPT
  // ==========================================================

  const prompt = `
You are an expert university-level question paper setter.

Your task is to generate a HIGH-QUALITY educational quiz using ONLY
the learning material provided below.

The purpose of this quiz is to test whether a student actually
understands the concepts in the uploaded material.

============================================================
VERY IMPORTANT: AVOID TRIVIAL QUESTIONS
============================================================

DO NOT create questions that simply recognize words from the
source material.

BAD EXAMPLE:

"Which of the following is related to Object-Oriented Programming?"

A. Object
B. Class
C. Object-Oriented
D. Programming

This is NOT a useful educational question.

Instead, create meaningful conceptual questions.

GOOD EXAMPLE:

"Which OOP principle restricts direct access to an object's
internal state and provides controlled access through methods?"

A. Inheritance
B. Encapsulation
C. Polymorphism
D. Method Overloading

Correct answer: B

GOOD EXAMPLE:

"A subclass provides its own implementation of a method already
defined in its parent class. Which concept is demonstrated?"

A. Method Overloading
B. Method Overriding
C. Encapsulation
D. Abstraction

Correct answer: B

GOOD EXAMPLE:

"Which OOP concept allows the same method name to behave
differently depending on the object that invokes it?"

A. Encapsulation
B. Inheritance
C. Polymorphism
D. Constructor

Correct answer: C

The student should need to THINK about the concept.

============================================================
DIFFICULTY
============================================================

Selected difficulty:

${level}

EASY:
- basic definitions
- fundamental concepts
- simple understanding
- straightforward examples

MEDIUM:
- conceptual understanding
- comparison between concepts
- relationships between concepts
- example-based questions
- choosing the correct concept for a situation

HARD:
- real-world scenarios
- reasoning
- application of concepts
- distinguishing similar concepts
- problem-based situations
- deeper understanding

============================================================
IMPORTANT CONCEPT COVERAGE
============================================================

First understand the learning material.

Identify the important concepts internally.

Distribute the questions across those important concepts.

For example, if the material contains:

- Class
- Object
- Encapsulation
- Abstraction
- Inheritance
- Polymorphism

Do NOT create five questions only about Class.

Try to cover different important concepts.

Do not invent concepts that are not supported by the material.

============================================================
OCR ERROR HANDLING
============================================================

The material may have been extracted using OCR.

OCR may create mistakes in technical terms.

For example:

"dash-oriented programming"

may actually mean:

"Object-Oriented Programming"

if the surrounding context clearly discusses OOP.

When an obvious OCR error occurs:

1. Understand the surrounding context.
2. Infer the intended technical term.
3. Use the correct standard technical terminology.
4. Never create a question based on the OCR mistake itself.

============================================================
MCQ REQUIREMENTS
============================================================

For every MCQ:

1. Exactly 4 options.
2. Exactly ONE correct answer.
3. All options must be meaningful.
4. Options must belong to the same conceptual area.
5. Wrong answers must be plausible.
6. Do not use random words.
7. Do not make the correct answer obviously longer.
8. Do not put the answer directly in the question.
9. Do not create word-recognition questions.
10. Do not simply replace a source word with a blank.
11. Avoid duplicate questions.
12. Avoid testing the same concept repeatedly.

============================================================
QUESTION TYPES
============================================================

Requested question types:

${types.join(", ")}

Generate exactly:

${count}

questions.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

Use exactly:

{
  "questions": [
    {
      "type": "mcq",
      "questionText": "Question here",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": "1",
      "explanation": "Explain why the answer is correct.",
      "topic": "Main topic",
      "concept": "Specific concept being tested",
      "difficulty": "${level}",
      "questionType": "conceptual understanding"
    }
  ]
}

============================================================
CORRECT ANSWER
============================================================

For MCQ:

correctAnswer MUST be:

"0"

"1"

"2"

or

"3"

Example:

options:

[
  "Inheritance",
  "Encapsulation",
  "Polymorphism",
  "Abstraction"
]

If Encapsulation is correct:

correctAnswer must be:

"1"

DO NOT return:

"Encapsulation"

============================================================
TRUE / FALSE
============================================================

For true_false questions:

correctAnswer must be:

"True"

or

"False"

============================================================
FILL IN THE BLANK
============================================================

For fill_in_the_blanks:

correctAnswer should contain the missing concept or term.

============================================================
SHORT ANSWER
============================================================

For short_answer:

correctAnswer should contain the important expected points.

============================================================
EVERY QUESTION MUST CONTAIN
============================================================

- type
- questionText
- correctAnswer
- explanation
- topic
- concept
- difficulty
- questionType

MCQs must additionally contain:

- options

============================================================
FINAL QUALITY CHECK
============================================================

Before returning the JSON, internally check every question.

Reject and replace any question that:

- is trivial
- only tests word recognition
- is unrelated to the material
- repeats another question
- tests the same concept unnecessarily
- contains meaningless options
- has more than one correct answer
- has no correct answer
- introduces unsupported information
- is based on an obvious OCR error
- simply copies a sentence from the material
- asks the student to identify a word instead of understanding
  the concept

The final quiz must be useful for a university student preparing
for an examination.

============================================================
LEARNING MATERIAL
============================================================

${sourceText}
`;

  // ==========================================================
  // GEMINI QUIZ GENERATION
  // ==========================================================

  if (genAI) {
    try {
      console.log(
        "Starting Gemini quiz generation..."
      );

      const responseText =
        await generateWithGemini(
          prompt,
          true
        );

      console.log(
        "Gemini quiz response received."
      );

      const parsed = JSON.parse(responseText);

      if (
        !parsed.questions ||
        !Array.isArray(parsed.questions)
      ) {
        throw new Error(
          "Gemini response does not contain a valid questions array."
        );
      }

      const questions =
        parsed.questions.slice(0, count);

      if (questions.length === 0) {
        throw new Error(
          "Gemini returned zero questions."
        );
      }

      console.log(
        `Successfully generated ${questions.length} questions.`
      );

      return questions;

    } catch (error) {
      console.error(
        "Gemini quiz generation failed:",
        error.message
      );
    }
  }

  // ==========================================================
  // LOCAL FALLBACK
  // ==========================================================
  //
  // We do NOT use the invalid OpenAI key here.
  //
  // If Gemini completely fails, return a clear error instead
  // of generating bad questions.
  //

  throw new Error(
    "Gemini is currently unavailable. Please try generating the quiz again in a few seconds."
  );
}


// ============================================================
// GENERATE AI FEEDBACK
// ============================================================

async function generateAIFeedbackText(
  questions,
  userAnswers,
  score
) {
  try {
    const questionData = Array.isArray(questions)
      ? questions
      : [];

    const answerData = userAnswers || {};

    const prompt = `
You are an educational feedback assistant.

Analyze the student's quiz performance and provide useful
learning feedback.

The feedback should:

1. Mention the student's performance.
2. Identify concepts the student appears to understand.
3. Identify concepts where the student made mistakes.
4. Suggest what they should study again.
5. Give practical recommendations.
6. Use simple and clear English.
7. Do not invent topics that are not present in the quiz.

Student score:

${score}

Quiz questions:

${JSON.stringify(
  questionData,
  null,
  2
)}

Student answers:

${JSON.stringify(
  answerData,
  null,
  2
)}

Return a concise but useful feedback paragraph.
`;

    if (genAI) {
      try {
        const text =
          await generateWithGemini(
            prompt,
            false
          );

        if (text) {
          return text.trim();
        }
      } catch (error) {
        console.error(
          "Gemini feedback generation failed:",
          error.message
        );
      }
    }

    return generateLocalFeedback(score);

  } catch (error) {
    console.error(
      "Feedback generation failed:",
      error.message
    );

    return generateLocalFeedback(score);
  }
}


// ============================================================
// LOCAL TOPIC IDENTIFIER
// ============================================================

function localTopicIdentifier(text) {
  if (
    !text ||
    typeof text !== "string"
  ) {
    return [];
  }

  const topics = [];

  const keywords = [
    "object oriented programming",
    "object-oriented programming",
    "class",
    "object",
    "encapsulation",
    "abstraction",
    "inheritance",
    "polymorphism",
    "method overloading",
    "method overriding",
    "constructor",
    "interface",
    "database",
    "normalization",
    "primary key",
    "foreign key",
    "sql",
    "operating system",
    "computer network",
    "data structure",
    "algorithm",
    "cloud computing",
    "machine learning",
    "artificial intelligence"
  ];

  const lowerText =
    text.toLowerCase();

  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      topics.push(keyword);
    }
  }

  return [...new Set(topics)];
}


// ============================================================
// LOCAL FEEDBACK
// ============================================================

function generateLocalFeedback(score) {
  const numericScore =
    Number(score) || 0;

  if (numericScore >= 80) {
    return "Excellent performance. You have a good understanding of the concepts. Continue practicing application-based questions and review the concepts where you made mistakes.";
  }

  if (numericScore >= 60) {
    return "Good performance. You understand many of the important concepts, but you should review the topics where you made mistakes and practice more conceptual questions.";
  }

  if (numericScore >= 40) {
    return "Your performance shows some understanding of the topic, but several concepts need more practice. Review the important concepts again and try more example-based questions.";
  }

  return "You need more practice with the learning material. Start by reviewing the basic concepts carefully and then practice simple conceptual and application-based questions.";
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  identifyTopics,
  generateQuiz,
  generateAIFeedbackText
};