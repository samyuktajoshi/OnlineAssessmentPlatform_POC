using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace ChatBotService.Services
{
    public class GeminiService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly ILogger<GeminiService> _logger;

        public GeminiService(HttpClient http, IConfiguration config, ILogger<GeminiService> logger)
        {
            _http = http;
            _config = config;
            _logger = logger;
        }

        public async Task<string> AskAsync(string message)
        {
            var apiKey = _config["Gemini:ApiKey"];

            if (string.IsNullOrEmpty(apiKey))
                return "API Key not configured";

            // Using Gemini 2.5 Flash 
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            // Clean JSON body with system_instruction + user message
            var body = new
            {
                system_instruction = new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = @"
                                You are a helpful AI assistant for an online coding platform.

Rules:
- Answer clearly and simply
- Keep responses short (maximum 4–6 lines)
- Focus only on the main points
- Avoid unnecessary details or long explanations
- Help with general concepts, coding questions, and learning guidance
- Explain in simple terms
- Provide step-by-step explanation only if needed
- Use short examples when helpful
- Be friendly and professional
- Ask for clarification if the question is unclear

- Do not use Markdown formatting like **, *, or backticks
- Return response in plain text only"
                        }
                    }
                },
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = message }
                        }
                    }
                }
            };

            try
            {
                var response = await _http.PostAsync(
                    url,
                    new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
                );

                var json = await response.Content.ReadAsStringAsync();

                // Debug log
                _logger.LogInformation("Gemini Raw Response: {json}", json);

                // Handle API error
                if (!response.IsSuccessStatusCode)
                {
                    return $"API Error: {json}";
                }

                using var doc = JsonDocument.Parse(json);

                //  Safe parsing
                if (!doc.RootElement.TryGetProperty("candidates", out var candidates))
                {
                    return "AI Error: No candidates returned";
                }

                if (candidates.GetArrayLength() == 0)
                {
                    return "AI returned empty response";
                }

                var candidate = candidates[0];

                if (!candidate.TryGetProperty("content", out var content))
                {
                    return "AI Error: No content";
                }

                if (!content.TryGetProperty("parts", out var parts))
                {
                    return "AI Error: No parts";
                }

                if (parts.GetArrayLength() == 0)
                {
                    return "AI Error: Empty parts";
                }

                var text = parts[0].GetProperty("text").GetString();

                //  Clean Markdown symbols
                text = (text ?? "")
                    .Replace("**", "")
                    .Replace("*", "")
                    .Replace("`", "");


                return text ?? "No response";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception during Gemini API call");
                return "Error while calling AI service ❌";
            }
        }
    }
}