using AssessmentService.Data;
using AssessmentService.Repositories;
using AssessmentService.Repositories.Interfaces;
using AssessmentService.Services;
using AssessmentService.Services.Interfaces;
using AssessmentService.Middleware;

using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// -------------------- DATABASE --------------------
builder.Services.AddDbContext<AssessmentDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// -------------------- CORS (IMPORTANT) --------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173") // React app
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// -------------------- JWT AUTH --------------------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");

        var key = jwt["Key"]
            ?? throw new InvalidOperationException("JWT Key missing");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,

            ValidIssuer = jwt["Issuer"],       // MUST match UserService
            ValidAudience = jwt["Audience"],   // MUST match UserService
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key))
        };
    });

builder.Services.AddAuthorization();

// -------------------- DEPENDENCY INJECTION --------------------
builder.Services.AddScoped<IAssessmentRepository, AssessmentRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<IAssessmentQuestionRepository, AssessmentQuestionRepository>();

builder.Services.AddScoped<IAssessmentService, AssessmentService.Services.AssessmentService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IAssessmentQuestionService, AssessmentQuestionService>();

// -------------------- CONTROLLERS --------------------
builder.Services.AddControllers();

// -------------------- SWAGGER --------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -------------------- APP --------------------
var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// -------------------- MIDDLEWARE ORDER (VERY IMPORTANT) --------------------

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");   // ✅ must be BEFORE auth

app.UseMiddleware<ExceptionMiddleware>(); // custom exception handling

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();