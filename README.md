# HR Workflow Designer

A production-grade HR workflow builder built using React, TypeScript, and React Flow.  
This application enables HR administrators to visually design, validate, simulate, and optimize workflows such as onboarding, approvals, and document processing.

Built as part of the Tredence Full Stack Engineering Intern case study, this project goes beyond baseline requirements with AI-assisted workflow generation, critique systems, and a scalable frontend architecture.

---

## 🚀 Overview

HR Workflow Designer is a canvas-first workflow editor that allows users to:

- Build workflows visually using drag-and-drop nodes
- Configure node behavior using dynamic forms
- Validate workflows using graph-based algorithms
- Simulate workflows with execution logs
- Generate workflows and insights using AI
- Import/export workflows as JSON
- Use templates for quick onboarding
- Track usage and performance with Vercel Analytics and Vercel Speed Insights

---

## 🧠 Features

### 🧩 Workflow Canvas
- Drag-and-drop node creation
- Connect nodes using edges
- Node selection and deletion
- Zoom, pan, minimap, and fit-to-view
- Background grid rendering

---

### 🔷 Node Types

- Start Node – Entry point  
- Task Node – Human task  
- Approval Node – Role-based approval  
- Automated Node – System-triggered action  
- End Node – Completion  

---

### 📝 Dynamic Node Configuration

Each node opens a real-time editable form panel:

- Fully controlled inputs
- Type-safe updates via Zustand
- Dynamic fields (especially for automated nodes)

Fields Supported:

- Start Node: Title, metadata  
- Task Node: Title, description, assignee, due date, custom fields  
- Approval Node: Title, role, threshold  
- Automated Node: Action selection + dynamic parameters  
- End Node: Message, summary toggle  

---

### 🔍 Workflow Validation

- Missing start/end nodes  
- Multiple start nodes  
- Cycle detection (DFS)  
- Disconnected nodes  
- Invalid graph structures  
- Node-level validation badges  

---

### ⚙️ Auto Layout

- Powered by Dagre  
- Automatically arranges nodes  
- Improves readability  

---

### 🧪 Workflow Simulation

- Serializes workflow graph  
- Sends data to mock /simulate API  
- Displays execution timeline  
- Supports AI-generated summaries  

---

### 🔌 Mock API Layer

Using MSW (Mock Service Worker) in local development and Vercel serverless routes in production:

- GET /api/automations  
- POST /api/simulate  

---

### 🤖 AI Features (Bonus)

- AI workflow generation (natural language → workflow graph)  
- AI critique (score + issues)  
- AI simulation narration  

---

### 📦 Import / Export

- Export workflows as JSON  
- Import workflows with validation  

---

### 📚 Templates

- Employee Onboarding  
- Leave Approval  
- Document Verification  

---

### 🎓 Guided Tutorial

- First-time onboarding overlay  
- Explains major features and UI  

---

## 🏗️ Architecture

The project follows a clean, modular, scalable architecture with clear separation of concerns.

---

## 🔑 Core Architectural Principles

- Separation of concerns  
- Strong typing using TypeScript  
- Reusable custom hooks  
- Centralized state via Zustand  
- Extensible node system  
- Graph-driven validation architecture  

---

## 🔄 Data Flow

Node Creation: Sidebar → Drag → Canvas → Store → Node initialized

Node Editing: Select node → Form panel → Store update → UI re-render

Validation: Graph traversal → Store → UI feedback

Simulation: Serialize → Validate → API → Execution log → UI

---

## 🧪 Testing

Unit Testing (Vitest):
- Graph traversal  
- Validation logic  
- Serialization  

E2E Testing (Cypress):
- Canvas interactions  
- Node forms  
- Simulation flow  
- Export/import  

---

## ⚙️ Tech Stack

- Frontend: React 19, TypeScript, Vite  
- State Management: Zustand  
- Canvas: React Flow (@xyflow/react)  
- Styling: Tailwind CSS  
- Data Fetching: React Query  
- Graph Layout: Dagre  
- Mocking: MSW  
- AI Integration: Groq API  
- Analytics: Vercel Analytics  
- Performance Monitoring: Vercel Speed Insights  
- Testing: Vitest + Cypress  

---

## ▶️ How to Run

npm install  
npm run dev  

Optional (for AI features):  
VITE_GROQ_API_KEY=your_key_here  

---

## ⚖️ Design Decisions

1. Canvas-First UX  
2. Strong Typing  
3. Mock API Layer  
4. Graph-Based Validation  
5. Extensibility  

---

## ✅ What Was Completed

- Fully functional workflow canvas  
- All 5 node types with dynamic forms  
- Graph validation system  
- Workflow simulation engine  
- Mock API integration  
- Import/export functionality  
- Templates system  
- Auto-layout feature  
- AI workflow generation & critique  
- Guided onboarding tutorial  
- Unit + E2E testing  

---

## 🔮 What I Would Add With More Time

- Backend persistence (PostgreSQL / Firestore)  
- Real-time collaboration (WebSockets)  
- Role-based authentication (OAuth/JWT)  
- Workflow version history  
- Visual error highlighting on nodes  
- Performance optimizations for large graphs  
- CI/CD pipeline  

---

## 📌 Conclusion

This project demonstrates strong frontend architecture, advanced state management, graph-based reasoning, and real-world engineering practices. It exceeds the baseline requirements by integrating AI capabilities, testing infrastructure, and scalable design patterns.
