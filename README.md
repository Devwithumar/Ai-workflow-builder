# ⚙️ AI Workflow Builder

An interactive **AI-powered workflow automation tool** that lets you **visually design, connect, and run AI workflows** — similar to tools like n8n, Zapier, and Hugging Face Spaces Builder.

Built with **React**, **Vite**, **React Flow**, **TailwindCSS**, and **Framer Motion**, this project provides a modern canvas where users can drag and connect AI modules such as **Text Generation**, **Image Generation**, **Analysis**, **Database**, and **Notion Integrations** — all in one place.

---

## 🚀 Features

- 🧠 **AI Text Gen Node** – generate text using the OpenAI API (GPT models)
- 🖼️ **AI Image Gen Node** – generate images using DALL·E or Stable Diffusion
- 🔍 **AI Analysis Node** – perform text or data analysis via AI
- 📧 **Send Email Node** – send dynamic emails using preset templates or custom APIs
- 🗄️ **Database Node** – save and retrieve workflow data from a local or remote DB
- 🗂️ **Notion Node** – create, update, or query Notion pages or databases
- 🌐 **API Call Node** – connect to any external REST API and process results
- ⏱️ **Delay Node** – pause execution for a set amount of time before proceeding
- 🔁 **Conditional Node** – run branches based on conditions or variable outputs
- 🧩 **Trigger Node** – starts the workflow (manual or scheduled)
- ⚡ **Live Execution Log** – watch your workflow execute in real-time
- 💾 **Auto Save** – workflows are stored in browser localStorage
- 🧱 **Privacy-Safe** – 100% local, no telemetry, no `.bolt` or cloud tracking

---

## 🧠 How It Works

The app uses **React Flow** to manage the visual graph of nodes and edges.  
Each node type performs a specific action, and nodes can be chained together to form automation pipelines.



---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + Vite |
| Flow Engine | React Flow |
| Styling | TailwindCSS + shadcn/ui + Framer Motion |
| State Management | Zustand (or React Hooks) |
| AI APIs | OpenAI API (text & image) |
| Optional Backend | Node.js + Express |
| Database | SQLite / Supabase (optional) |

---

## 📦 Installation

```bash
# 1️⃣ Clone this repository
git clone https://github.com/Devwithumar/ai-workflow-builder.git

# 2️⃣ Go into the project
cd ai-workflow-builder

# 3️⃣ Install dependencies
npm install

# 4️⃣ Run the app
npm run dev

| Node             | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| **Trigger**      | Starts the workflow manually or automatically                    |
| **AI Text Gen**  | Uses OpenAI GPT to generate text based on prompt                 |
| **AI Image Gen** | Generates images using AI image models                           |
| **AI Analysis**  | Runs an AI model for summarization, sentiment, or classification |
| **Send Email**   | Sends an email to specified recipient(s)                         |
| **Database**     | Reads/writes to a connected database                             |
| **Notion**       | Interacts with Notion pages or databases                         |
| **API Call**     | Makes external API requests                                      |
| **Delay**        | Waits a specified number of seconds before continuing            |
| **Condition**    | Adds if/else logic to the workflow                               |


Example flow:
