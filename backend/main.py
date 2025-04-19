from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the parent directory to the path to help with imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the routers from the modules
# Note: Python doesn't like hyphens in module names, so we use importlib
import importlib.util
import importlib.machinery

# Helper function to load modules from paths with hyphens
def load_module_from_path(module_name, file_path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

# Get the base directory
base_path = os.path.dirname(os.path.abspath(__file__))

# Load the modules
# job_search = load_module_from_path("job_search", os.path.join(base_path, "Job-search", "job_search.py"))
# job_details = load_module_from_path("job_details", os.path.join(base_path, "Job-search", "job_details.py"))
# job_salary = load_module_from_path("job_salary", os.path.join(base_path, "Job-search", "job_salary.py"))
resume_parser = load_module_from_path("resume_parser", os.path.join(base_path, "Job-search", "resume_parser.py"))

# Create the FastAPI application
app = FastAPI(title="Job Search API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
# app.include_router(job_search.router, prefix="/api", tags=["Job Search"])
# app.include_router(job_details.router, prefix="/api", tags=["Job Details"])
# app.include_router(job_salary.router, prefix="/api", tags=["Job Salary"])
app.include_router(resume_parser.router, prefix="/api", tags=["Resume Parser"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Job Search API. Use /docs to view the API documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
