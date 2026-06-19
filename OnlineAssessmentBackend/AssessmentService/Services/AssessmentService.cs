using AssessmentService.Data;
using AssessmentService.DTOs;
using AssessmentService.Exceptions;
using AssessmentService.Models;
using AssessmentService.Repositories.Interfaces;
using AssessmentService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssessmentService.Services
{
    public class AssessmentService : IAssessmentService
    {
        private readonly IAssessmentRepository _repo;
        private readonly ILogger<AssessmentService> _logger;
        private readonly AssessmentDbContext _context;
        public AssessmentService(
            IAssessmentRepository repo,
            ILogger<AssessmentService> logger,
            AssessmentDbContext context
            )
        {
            _repo = repo;
            _logger = logger;
            _context = context;
        }

        // CREATE (ADMIN)
        public async Task<int> CreateAsync(CreateAssessmentDto dto, ClaimsPrincipal user)
        {
            _logger.LogInformation("Create assessment request received");

            var claim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
            {
                _logger.LogWarning("Unauthorized create attempt");
                throw new UnauthorizedAccessException("Invalid token");
            }

            var userId = int.Parse(claim.Value);
            _logger.LogInformation("Creating assessment '{Title}' by User {UserId}", dto.Title, userId);

            var assessment = new Assessment
            {
                Title = dto.Title,
                Description = dto.Description,
                DurationMinutes = dto.DurationMinutes,
                CreatedBy = userId,
                Status = dto.Status ?? "Active",
                AvailableFrom = dto.AvailableFrom,
                AvailableUntil = dto.AvailableUntil
            };

            await _repo.AddAsync(assessment);
            _logger.LogInformation("Assessment created with ID {Id}", assessment.Id);

            return assessment.Id;
        }

        // GET ALL (CANDIDATE VIEW)
        
        public async Task<List<AssessmentDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetching assessments for candidate view");

            var list = await _repo.GetAllAsync();
            var now = DateTime.Now;

            // Auto-close expired assessments
            foreach (var a in list)
            {
                if (a.Status == "Active" &&
                    a.AvailableUntil.HasValue &&
                    now > a.AvailableUntil.Value)
                {
                    _logger.LogInformation("Auto-closing assessment {Id}", a.Id);
                    a.Status = "Closed";
                    await _repo.UpdateAsync(a);
                }
            }

           
            // Draft/Hidden = admin only, not visible to candidates 
            var visible = list.Where(a => a.Status == "Active" || a.Status == "Closed");

            return visible.Select(a => new AssessmentDto
            {
                AssessmentId = a.Id,
                AssessmentName = a.Title,
                Description = a.Description,
                DurationMinutes = a.DurationMinutes,
                AvailableFrom = a.AvailableFrom,
                AvailableUntil = a.AvailableUntil,
                Status = a.Status  
            }).ToList();
        }

        // GET BY ID 
        public async Task<AssessmentDto?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Fetching assessment {Id}", id);

            var assessment = await _repo.GetByIdAsync(id);

            if (assessment == null)
            {
                _logger.LogWarning("Assessment not found {Id}", id);
                throw new NotFoundException("Assessment not found");
            }

            if (assessment.Status != "Active")
            {
                _logger.LogWarning("Inactive assessment access attempt {Id}", id);
                throw new BadRequestException("Assessment is not active");
            }

            var now = DateTime.Now;

            if (assessment.AvailableFrom.HasValue && now < assessment.AvailableFrom.Value)
            {
                _logger.LogWarning("Assessment {Id} not yet available", id);
                throw new BadRequestException("Assessment not yet available");
            }

            if (assessment.AvailableUntil.HasValue && now > assessment.AvailableUntil.Value)
            {
                _logger.LogWarning("Assessment {Id} expired", id);
                throw new BadRequestException("Assessment has closed");
            }

            return new AssessmentDto
            {
                AssessmentId = assessment.Id,
                AssessmentName = assessment.Title,
                Description = assessment.Description,
                DurationMinutes = assessment.DurationMinutes,
                AvailableFrom = assessment.AvailableFrom,
                AvailableUntil = assessment.AvailableUntil
            };
        }

        // GET MY ASSESSMENTS (ADMIN)
        public async Task<List<Assessment>> GetMyAssessmentsAsync(ClaimsPrincipal user)
        {
            var userId = int.Parse(
                user.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            _logger.LogInformation("Fetching assessments created by User {UserId}", userId);

            return await _repo.GetByAdminIdAsync(userId);
        }

        // DELETE (ADMIN)
        public async Task<string> DeleteAsync(int id, ClaimsPrincipal user)
        {
            var userId = int.Parse(
                user.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            _logger.LogInformation("Delete request for Assessment {Id} by User {UserId}", id, userId);

            var assessment = await _repo.GetByIdAsync(id);

            if (assessment == null)
            {
                _logger.LogWarning("Assessment not found for delete {Id}", id);
                throw new NotFoundException("Assessment not found");
            }

            if (assessment.CreatedBy != userId)
            {
                _logger.LogWarning("Unauthorized delete attempt for Assessment {Id}", id);
                throw new UnauthorizedAccessException("You cannot delete this assessment");
            }

            await _repo.DeleteAsync(assessment);
            _logger.LogInformation("Assessment {Id} deleted by user {UserId}", id, userId);

            return "Assessment deleted";
        }

        // UPDATE (ADMIN)
        public async Task<string> UpdateAsync(int id, UpdateAssessmentDto dto, ClaimsPrincipal user)
        {
            var userId = int.Parse(
                user.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            _logger.LogInformation("Update request for Assessment {Id} by User {UserId}", id, userId);

            var assessment = await _repo.GetByIdAsync(id);

            if (assessment == null)
            {
                _logger.LogWarning("Assessment not found for update {Id}", id);
                throw new NotFoundException("Assessment not found");
            }

            if (assessment.CreatedBy != userId)
            {
                _logger.LogWarning("Unauthorized update attempt {Id}", id);
                throw new UnauthorizedAccessException("You cannot update this assessment");
            }

            assessment.Title = dto.Title;
            assessment.Description = dto.Description;
            assessment.DurationMinutes = dto.DurationMinutes;
            assessment.Status = dto.Status ?? assessment.Status;
            assessment.AvailableFrom = dto.AvailableFrom;
            assessment.AvailableUntil = dto.AvailableUntil;

            await _repo.UpdateAsync(assessment);
            _logger.LogInformation("Assessment {Id} updated by user {UserId}", id, userId);

            return "Assessment updated";
        }

        // UPDATE STATUS
        public async Task UpdateStatusAsync(int id, string status, ClaimsPrincipal user)
        {
            _logger.LogInformation("Updating status of Assessment {Id} to {Status}", id, status);

            var assessment = await _repo.GetByIdAsync(id);

            if (assessment == null)
            {
                _logger.LogWarning("Assessment not found for status update {Id}", id);
                throw new NotFoundException("Assessment not found");
            }

            assessment.Status = status;
            await _repo.UpdateAsync(assessment);

            _logger.LogInformation("Assessment {Id} status updated to {Status}", id, status);
        }
        public async Task<AssessmentDto> GetByIdInternalAsync(int id)
        {
            var assessment = await _context.Assessments.FindAsync(id);

            if (assessment == null)
                return null;

            return new AssessmentDto
            {
                AssessmentName = assessment.Title
            };
        }


        
    }
}