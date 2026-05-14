using System.Net;
using System.Text.Json;
using UserService.Exceptions;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BadRequestException ex)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await WriteErrorResponse(context, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await WriteErrorResponse(context, ex.Message);
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await WriteErrorResponse(context, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await WriteErrorResponse(context, "Internal Server Error");
        }
    }

    private static async Task WriteErrorResponse(HttpContext context, string message)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            StatusCode = context.Response.StatusCode,
            Message = message
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}