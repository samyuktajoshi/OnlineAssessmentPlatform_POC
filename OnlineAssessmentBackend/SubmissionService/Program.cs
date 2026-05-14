using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

using SubmissionService.Data;
using SubmissionService.Repositories;
using SubmissionService.Repositories.Interfaces;
using SubmissionService.Services;
using SubmissionService.Services.Interfaces;
using SubmissionService.Middleware;

var builder = WebApplication.CreateBuilder(args);

// -------------------- DATABASE --------------------
builder.Services.AddDbContext<SubmissionDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// -------------------- JWT AUTH --------------------
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        var jwt = builder.Configuration.GetSection("Jwt");

        var key = jwt["Key"]
            ?? throw new InvalidOperationException("JWT Key missing");

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key))
        };
    });

builder.Services.AddAuthorization();

// -------------------- CORS --------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// -------------------- DEPENDENCY INJECTION --------------------
builder.Services.AddScoped<ISubmissionRepository, SubmissionRepository>();
builder.Services.AddScoped<ISubmissionService, SubmissionnService>();

// -------------------- CONTROLLERS --------------------
builder.Services.AddControllers();

// -------------------- SWAGGER --------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -------------------- APP --------------------
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// -------------------- MIDDLEWARE PIPELINE --------------------
app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseMiddleware<ExceptionMiddleware>(); // global error handling

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();