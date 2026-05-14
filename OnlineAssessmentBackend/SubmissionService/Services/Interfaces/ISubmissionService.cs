using SubmissionService.DTOs;
using System.Security.Claims;

namespace SubmissionService.Services.Interfaces
{
    public interface ISubmissionService
    {
        Task<int> SubmitAsync(SubmitTestDto dto, ClaimsPrincipal user);
        Task<SubmissionDto?> GetByIdAsync(int id);
    }
}
