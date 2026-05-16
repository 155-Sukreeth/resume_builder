@echo off
echo Starting Resume Builder...
echo.

conda run -n resume_builder python -u -m backend.main
if %errorlevel% neq 0 (
    echo.
    echo Failed to start with 'conda run -n resume_builder python'. Trying 'python'...
    python -u -m backend.main
)

if %errorlevel% neq 0 (
    echo.
    echo Failed to start with 'python'. Trying 'py'...
    py -u -m backend.main
)

if %errorlevel% neq 0 (
    echo.
    echo Failed to start the server.
    pause
)
