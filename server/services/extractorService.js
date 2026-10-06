const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

/**
 * Extracts raw text from an uploaded file based on its MIME type.
 * Supports PDF, DOCX, TXT, Images (PNG, JPG, JPEG via OCR), and Audio/Video.
 */
async function extractText(filePath, mimeType, originalName) {
  const extension = path.extname(originalName).toLowerCase();

  try {
    if (mimeType === 'text/plain' || extension === '.txt') {
      const text = await fs.readFile(filePath, 'utf-8');
      return text.trim();
    }

    if (mimeType === 'application/pdf' || extension === '.pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text.trim();
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      extension === '.docx'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    }

    if (mimeType.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.bmp', '.tiff'].includes(extension)) {
      const result = await Tesseract.recognize(filePath, 'eng');
      return result.data.text.trim();
    }

    if (mimeType.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(extension)) {
      throw new Error('Audio transcription is not configured. Please upload a text, PDF, DOCX, or image file, or configure a speech-to-text provider.');
    }

    if (mimeType.startsWith('video/') || ['.mp4', '.avi', '.mkv', '.mov', '.webm'].includes(extension)) {
      throw new Error('Video transcription is not configured. Please upload a text, PDF, DOCX, or image file, or configure a speech-to-text provider.');
    }

    // Default fallback: Try reading as text
    const rawText = await fs.readFile(filePath, 'utf-8');
    return rawText.trim();
  } catch (error) {
    console.error(`Error extracting text from ${originalName}:`, error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

/**
 * Simulates speech-to-text transcript extraction for audio and video files.
 * Provides custom structured learning content if the file name contains keywords.
 */
function simulateAudioVideoTranscription(filename, fileType) {
  const lowercaseName = filename.toLowerCase();
  
  let topic = "General Education Lecture";
  let content = "";

  if (lowercaseName.includes('java')) {
    topic = "Java Programming Foundations";
    content = `Welcome back to our session on Java Programming. Today, we are deep-diving into Java fundamentals. 
    First, we'll discuss Object-Oriented Programming (OOP) concepts. In Java, everything is associated with classes and objects, along with its attributes and methods. 
    For example, a class is like a blueprint, and an object is an instance of that class. The four pillars of OOP are Inheritance, Polymorphism, Encapsulation, and Abstraction.
    Inheritance allows one class to inherit the attributes and methods of another. Polymorphism means "many forms", allowing methods to perform different tasks based on the object.
    Encapsulation ensures sensitive data is hidden from users, achieved by declaring class variables as private and providing public get and set methods.
    Abstraction hides implementation details and only shows essential features.
    Next, we'll talk about Exception Handling. Java uses try, catch, and finally blocks to handle runtime exceptions like NullPointerException, ArithmeticException, and ArrayIndexOutOfBoundsException.
    Finally, we will cover the Java Collections Framework, specifically ArrayList and HashMap. An ArrayList is a resizable array, while a HashMap stores items in key/value pairs.`;
  } else if (lowercaseName.includes('python')) {
    topic = "Python Programming Foundations";
    content = `Welcome to this Python video tutorial. Today we discuss Python lists, dictionaries, and decorators.
    Python is an interpreted, high-level, general-purpose programming language. Its design philosophy emphasizes code readability.
    Lists in Python are ordered, mutable collections of items written with square brackets. They support indexing, slicing, and methods like append() and extend().
    Dictionaries store data in key-value pairs, which are unordered (or ordered since Python 3.7) and mutable. You can access values using keys, keys(), and values() methods.
    Decorators are a very powerful tool in Python. They allow programmers to modify the behavior of a function or class. Decorators wrap another function to extend its behavior without permanently modifying it.
    We also look at file handling in Python using the 'with open()' statement, which ensures files are properly closed after operations, preventing memory leaks and file locks.`;
  } else if (lowercaseName.includes('db') || lowercaseName.includes('sql') || lowercaseName.includes('database')) {
    topic = "Database Management Systems (DBMS)";
    content = `In today's database lecture, we explore Relational Databases, SQL, and NoSQL systems like MongoDB.
    A Relational Database (RDBMS) stores data in tables consisting of rows and columns. We use SQL (Structured Query Language) to query this data.
    Key concepts include Primary Keys (uniquely identify a record in a table) and Foreign Keys (link tables together).
    Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. The main normal forms are 1NF, 2NF, and 3NF.
    Transactions are sequences of database operations executed as a single unit. They must follow ACID properties: Atomicity (all or nothing), Consistency (preserves database rules), Isolation (independent execution), and Durability (permanently saved).
    In NoSQL databases, like MongoDB, data is stored in flexible JSON-like documents. MongoDB uses collections instead of tables and documents instead of rows, which allows for horizontal scaling and dynamic schemas.`;
  } else {
    // Generic high-quality educational transcription
    topic = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    content = `Welcome to this educational presentation on ${topic}. Today we will discuss the core principles of this topic.
    Understanding the foundational concepts is critical. We will explore the background, the current state of knowledge, and practical examples.
    First, let's analyze the historical context and why this subject matters. It shapes how modern systems and methodologies operate.
    Second, we examine the primary structural elements and key definitions that define this field of study.
    Third, we review typical challenges, potential pitfalls, and strategies for success. In summary, mastering this topic requires consistent practice, critical analysis of the core parameters, and review of case studies. 
    Make sure to take notes on the main pillars discussed today.`;
  }

  return `[Transcript extracted from uploaded ${fileType}: ${filename}]\n\nTopic: ${topic}\n\n${content}`;
}

module.exports = {
  extractText,
};
