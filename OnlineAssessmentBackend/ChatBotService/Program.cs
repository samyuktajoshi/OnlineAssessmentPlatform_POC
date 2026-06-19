using ChatBotService.Services;

var builder = WebApplication.CreateBuilder(args);

// ✅ Add services to container
builder.Services.AddControllers();

// ✅ Register Gemini / Chat service
builder.Services.AddHttpClient<GeminiService>();

// ✅ Swagger (API testing)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ CORS (for frontend connection)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ✅ Enable Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Middleware pipeline
app.UseCors("AllowFrontend");   // ✅ IMPORTANT (for React)
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();