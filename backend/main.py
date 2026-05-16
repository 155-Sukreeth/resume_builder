import uvicorn
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router

app = FastAPI(title="Resume Builder API")

@app.get("/")
def read_root():
    return RedirectResponse(url="/frontend/index.html")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static files
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# Include API routes
app.include_router(router, prefix="/api")

if __name__ == '__main__':
    print("Serving at http://localhost:8000/frontend/index.html", flush=True)
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
