#!/bin/bash

sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv -y


python3 -m venv venv

. venv/bin/activate

pip install -r requirements.txt

echo "All files successfully installed."
echo "Running project:"

which uvicorn

uvicorn main:app --reload