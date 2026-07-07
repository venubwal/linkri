@echo off
echo Starting local web server to fix YouTube origin restrictions...
start http://localhost:8000
python -m http.server 8000
