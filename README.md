# Resume Builder API

A professional, zero-build-step resume builder with a modern split-screen UI and headless PDF export capabilities.

## Architecture

This project follows a strict separation of concerns typical of senior-level Full-Stack applications:

- **Backend**: Built with FastAPI. Structured into modular components (`api`, `core`, `models`, `services`) to ensure testability and clear domain boundaries.
- **Frontend**: Vanilla HTML/CSS/JS cleanly separated into `css/` and `js/` directories. This ensures a zero-build-step requirement, allowing anyone to run the app without installing Node.js.
- **Rendering Engine**: Jinja2 is used as the single source of truth for the resume layout. The UI preview uses an iframe that renders the Jinja template, ensuring 1:1 parity with the final PDF.
- **PDF Export**: Playwright automates Headless Chromium to generate pixel-perfect, vector-based A4 PDFs directly from the rendered HTML.

## Setup Instructions

### 1. Environment Setup

We use Conda to manage dependencies and isolate the Python environment.

```bash
# Create the environment from the provided file
conda env create -f environment.yml

# Activate the environment
conda activate resume_builder
```

### 2. Install Playwright Browsers
Playwright requires browser binaries to generate the PDF.

```bash
playwright install chromium
```

### 3. Run the Application

You can use the provided Windows batch script:
```cmd
run.bat
```
Or run it manually:
```bash
python -m backend.main
```

The application will be available at: `http://localhost:8000`

## Features
- **Real-time Preview**: Synchronized rendering of your data into the Jinja template.
- **Auto-Drafting**: Automatically saves your progress locally to `data/drafts/`.
- **Vector PDF Export**: ATS-friendly, fully selectable text PDFs exported to `data/exports/`.
