using System.Text.Json;
using ResultService.Exceptions;

namespace ResultService.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (BadRequestException ex)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await Write(context, ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await Write(context, ex.Message);
            }
            catch (NotFoundException ex)
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await Write(context, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await Write(context, "Internal Server Error");
            }
        }

        private static async Task Write(HttpContext context, string message)
        {
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(new
                {
                    StatusCode = context.Response.StatusCode,
                    Message = message
                })
            );
        }
    }
}