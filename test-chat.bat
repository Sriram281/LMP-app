@echo off
echo Testing chatbot API...
curl -X POST http://localhost:3003/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"What courses are available?\"}"
echo.
echo.
pause