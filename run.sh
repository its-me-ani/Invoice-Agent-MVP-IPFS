#!/bin/bash

# Activate virtual environment
if [ -d "./.venv" ]; then
    echo "Activating virtual environment..."
    source ./.venv/bin/activate
else
    echo "Error: Virtual environment ./.venv not found!"
    exit 1
fi

# Run python3 main.py
echo "Starting the application..."
python3 main.py
