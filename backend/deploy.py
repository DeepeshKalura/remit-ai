import os
import subprocess
import json
import shutil

# --- CONFIGURATION ---
RESOURCE_GROUP = "RemitAI-RG"
APP_NAME = "remit-ai-backend-api"
ZIP_FILE = "deploy.zip"

def run_command(command):
    print(f"🔌 Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Error:\n{result.stderr}")
        return False
    print(f"✅ Success")
    return result.stdout

def read_env_vars():
    """Reads .env file and returns a dictionary of valid keys."""
    print("🔥 Processing .env file...")
    env_vars = {}
    if not os.path.exists(".env"):
        print("⚠️ No .env file found!")
        return {}
        
    with open(".env", "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, value = line.split("=", 1)
                # Clean quotes and spaces
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                env_vars[key] = value
    return env_vars

def deploy():
    print(f"🚀 Starting Deployment for {APP_NAME}...")

    # 1. Prepare Env Vars
    env_data = read_env_vars()
    
    # Add build settings
    env_data["SCM_DO_BUILD_DURING_DEPLOYMENT"] = "true"
    env_data["ENABLE_ORYX_BUILD"] = "true"
    env_data["LLM_PROVIDER"] = "openai" # Force provider for Prod

    env_data["SCM_COMMAND_IDLE_TIMEOUT"] = "1800" 
    env_data["WEBSITES_CONTAINER_START_TIME_LIMIT"] = "1800"

    # Convert to space-separated string for AZ CLI (Key=Value)
    # We quote the value to handle spaces safely
    settings_list = [f'{k}="{v}"' for k, v in env_data.items()]
    settings_str = " ".join(settings_list)

    # 2. Upload Settings
    print("⚙️  Pushing Environment Variables to Azure...")
    # Note: We don't print settings_str to log to keep secrets safe
    run_command(f'az webapp config appsettings set --resource-group {RESOURCE_GROUP} --name {APP_NAME} --settings {settings_str}')

    # 3. Configure Startup
    print("🔌 Configuring Startup Command...")
    run_command(f'az webapp config set --resource-group {RESOURCE_GROUP} --name {APP_NAME} --startup-file "gunicorn --bind=0.0.0.0:8000 main:app -w 2 -k uvicorn.workers.UvicornWorker"')

    # 4. Zip and Deploy
    print("📦 Packaging...")
    if os.path.exists(ZIP_FILE):
        os.remove(ZIP_FILE)
        
    # Use git ls-files to respect .gitignore
    subprocess.run(f'git ls-files -c -o --exclude-standard | zip {ZIP_FILE} -@', shell=True)

    print("☁️  Deploying to Azure...")
    run_command(f'az webapp deploy --resource-group {RESOURCE_GROUP} --name {APP_NAME} --src-path {ZIP_FILE} --type zip')

    print("✅ Deployment Complete!")
    print(f"👇 View logs: az webapp log tail --name {APP_NAME} --resource-group {RESOURCE_GROUP}")

if __name__ == "__main__":
    deploy()