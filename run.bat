@echo off
echo Starting Resume Builder...
echo.

conda run python -u server.py
if %errorlevel% neq 0 (
    echo.
    echo Failed to start with 'conda run python'. Trying 'python'...
    python -u server.py
)

if %errorlevel% neq 0 (
    echo.
    echo Failed to start with 'python'. Trying 'py'...
    py -u server.py
)

if %errorlevel% neq 0 (
    echo.
    echo Failed to start the server.
    pause
)
