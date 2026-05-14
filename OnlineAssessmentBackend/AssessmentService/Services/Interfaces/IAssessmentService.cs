using AssessmentService.DTOs;
using AssessmentService.Models;
using System.Security.Claims;

namespace AssessmentService.Services.Interfaces
{
    public interface IAssessmentService
    {
        Task<int> CreateAsync(CreateAssessmentDto dto, ClaimsPrincipal user);

        Task<List<AssessmentDto>> GetAllAsync();
        Task<AssessmentDto?> GetByIdAsync(int id);

        Task<List<Assessment>> GetMyAssessmentsAsync(ClaimsPrincipal user);

        Task<string> UpdateAsync(int id, UpdateAssessmentDto dto, ClaimsPrincipal user);

        Task<string> DeleteAsync(int id, ClaimsPrincipal user);
        Task UpdateStatusAsync(int assessmentId, string status, ClaimsPrincipal user);
    }
}