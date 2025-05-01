#!/bin/sh
set -e

# Function to load environment variables from .env file
load_env_file() {
  if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    
    # Read .env file line by line
    while IFS= read -r line || [ -n "$line" ]; do
      # Skip comments and empty lines
      case "$line" in
        \#*|"") continue ;;
      esac
      
      # Extract variable name and value
      var_name=$(echo "$line" | cut -d '=' -f 1)
      var_value=$(echo "$line" | cut -d '=' -f 2-)
      
      # Remove quotes if present
      var_value=$(echo "$var_value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
      
      # Export the variable
      export "$var_name"="$var_value"
      echo "Loaded: $var_name"
    done < .env
    
    echo "Environment variables loaded successfully."
  else
    echo "No .env file found, using default environment variables."
  fi
}

# Load environment variables
load_env_file

# Print environment summary (without showing secrets)
echo "Environment summary:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "MONGODB_URI: $(echo $MONGODB_URI | sed 's/\/\/.*@/\/\/[CREDENTIALS]@/')"
echo "FRONTEND_URL: $FRONTEND_URL"
echo "ENABLE_SCHEDULERS: $ENABLE_SCHEDULERS"

# Check for required environment variables
if [ -z "$MONGODB_URI" ]; then
  echo "WARNING: MONGODB_URI is not set. Application may not function correctly."
fi

if [ -z "$JWT_SECRET" ]; then
  echo "WARNING: JWT_SECRET is not set. Using default value for development only!"
  export JWT_SECRET="dev_secret_do_not_use_in_production"
fi

# Execute the main command
exec "$@"