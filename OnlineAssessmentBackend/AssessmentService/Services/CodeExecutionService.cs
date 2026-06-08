using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace AssessmentService.Services
{
    public class CodeExecutionService
    {
        private readonly HttpClient _http;
        private readonly ILogger<CodeExecutionService> _logger;

        public CodeExecutionService(HttpClient http, ILogger<CodeExecutionService> logger)
        {
            _http = http;
            _logger = logger;
        }

        public async Task<string> RunCodeAsync(string code, string input)
        {
            _logger.LogInformation("Code execution request received");
            _logger.LogInformation("Input provided: {Input}", input);

            try
            {
                var body = new
                {
                    source_code = code,
                    language_id = 71,  // ✅ Python
                    stdin = input
                };

                var response = await _http.PostAsync(
                    "https://ce.judge0.com/submissions?wait=true",
                    new StringContent(
                        JsonSerializer.Serialize(body),
                        Encoding.UTF8,
                        "application/json"
                    )
                );

                _logger.LogInformation("Judge0 API called successfully");

                var json = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Response received from Judge0");

                using var doc = JsonDocument.Parse(json);

                // ✅ SUCCESS OUTPUT
                if (doc.RootElement.TryGetProperty("stdout", out var stdout))
                {
                    var output = stdout.GetString();
                    _logger.LogInformation("Code executed successfully. Output: {Output}", output);
                    return output;
                }

                // ❌ RUNTIME ERROR
                if (doc.RootElement.TryGetProperty("stderr", out var err))
                {
                    var error = err.GetString();
                    _logger.LogWarning("Runtime error during execution: {Error}", error);
                    return error;
                }

                // ❌ COMPILATION ERROR
                if (doc.RootElement.TryGetProperty("compile_output", out var comp))
                {
                    var error = comp.GetString();
                    _logger.LogWarning("Compilation error: {Error}", error);
                    return error;
                }

                // ❗ NO OUTPUT CASE
                _logger.LogWarning("Execution finished but no output returned");

                return "No output";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred during code execution");
                return "Error executing code";
            }
        }
    }
}
