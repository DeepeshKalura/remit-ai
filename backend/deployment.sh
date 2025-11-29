#!/bin/bash

# --- CONFIGURATION ---
RESOURCE_GROUP="RemitAI-RG"
APP_NAME="remit-ai-backend-api"

echo "🚀 Starting Deployment Sequence for $APP_NAME..."

# --- 1. PREPARE ENV VARS ---
echo "🔥 Processing .env file..."

# Initialize empty string
SETTINGS_STRING=""

# Read .env line by line
while IFS= read -r line || [ -n "$line" ]; do
  # Skip comments and empty lines
  if [[ "$line" =~ ^#.* ]] || [[ -z "$line" ]]; then continue; fi

  # 1. Remove spaces around '='
  # 2. Remove double quotes entirely
  # 3. Remove single quotes entirely
  CLEAN_LINE=$(echo "$line" | sed 's/ *= */=/' | tr -d '"' | tr -d "'")
  
  # Append to string
  SETTINGS_STRING="$SETTINGS_STRING $CLEAN_LINE"
done < .env


# --- 2. UPLOAD SETTINGS ---
echo "⚙️  Pushing Environment Variables to Azure..."

# We pass the sanitised settings string, PLUS our production overrides
# We explicitly override LLM_PROVIDER to openai because 'ollama' won't work on Azure
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings $SETTINGS_STRING \
  SCM_DO_BUILD_DURING_DEPLOYMENT=true \
  ENABLE_ORYX_BUILD=true

# --- 3. CONFIGURE STARTUP ---
echo "🔌 Configuring Startup Command..."
# We are zipping the ROOT of the folder, so main.py is at the top level.
# We do NOT need '--chdir backend' here.
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "gunicorn --bind=0.0.0.0:8000 main:app -w 2 -k uvicorn.workers.UvicornWorker"

# --- 4. ZIP AND DEPLOY ---
echo "📦 Packaging..."
rm -f deploy.zip
# Zip everything in current folder, excluding junk

git ls-files -c -o --exclude-standard | zip deploy.zip -@

echo "☁️  Deploying to Azure..."
az webapp deploy \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --src-path deploy.zip \
  --type zip

echo "✅ Deployment Complete!"
echo "👇 To view logs, run:"
echo "az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"