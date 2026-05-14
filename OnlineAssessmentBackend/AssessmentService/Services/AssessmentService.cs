using AssessmentService.DTOs;
using AssessmentService.Models;
using AssessmentService.Repositories.Interfaces;
using AssessmentService.Services.Interfaces;
using System.Security.Claims;
using AssessmentService.Exceptions;

namespace AssessmentService.Services
{
    public class AssessmentService : IAssessmentService
    {
        private readonly IAssessmentRepository _repo;
        private readonly ILogger<AssessmentService> _logger;

        public AssessmentService(
            IAssessmentRepository repo,
            ILogger<AssessmentService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        // ✅ CREATE (ADMIN)
        public async Task<int> CreateAsync(CreateAssessmentDto dto, ClaimsPrincipal user)
        {
            var claim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                throw new UnauthorizedAccessException("Invalid token");

            var userId = int.Parse(claim.Value);

            var assessment = new Assessment
            {
                Title = dto.Title,
                Description = dto.Description,
                DurationMinutes = dto.DurationMinutes,
                CreatedBy = userId,

                // ✅ NEW FIELDS (SAFE DEFAULTS)
                Status = dto.Status ?? "Active",
                AvailableFrom = dto.AvailableFrom,
                AvailableUntil = dto.AvailableUntil
            };

            await _repo.AddAsync(assessment);

            return assessment.Id;
        }

        // ✅ GET ALL (CANDIDATE VIEW)
        public async Task<List<AssessmentDto>> GetAllAsync()
        {
            var list = await _repo.GetAllAsync();

            // ✅ Candidate sees ONLY Active assessments
            var active = list.Where(a => a.Status == "Active");

            return active.Select(a => new AssessmentDto
            {
                AssessmentId = a.Id,
                AssessmentName = a.Title,
                Description = a.Description,
                DurationMinutes = a.DurationMinutes
            }).ToList();
        }

        // ✅ GET BY ID (CANDIDATE START TEST)
        public async Task<AssessmentDto?> GetByIdAsync(int id)
        {
            var assessment = await _repo.GetByIdAsync(id);

            if (assessment == null)
                throw new NotFoundException("Assessment not found");

            // ✅ STATUS CHECK
            if (assessment.Status != "Active")
                throw new BadRequestException("Assessment is not active");

            // ✅ AVAILABILITY WINDOW CHECK
            var now = DateTime.Now;

            if (assessment.AvailableFrom.HasValue && now < assessment.AvailableFrom.Value)
                throw new BadRequestException("Assessment not yet available");

            if (assessment.AvailableUntil.HasValue && now > assessment.AvailableUntil.Value)
                throw new BadRequestException("Assessment has closed");

            return new AssessmentDto
            {
                AssessmentId = assessment.Id,
                AssessmentName = assessment.Title,
                Description = assessment.Description,
                DurationMinutes = assessment.DurationMinutes
            };
        }

        // ✅ GET MY ASSESSMENTS (ADMIN)
        public async Task<List<Assessment>> GetMyAssessmentsAsync(ClaimsPrincipal user)
        {
            var userId = int.Parse(
                user.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            return await _repo.GetByAdminIdAsync(userId);
        }

        // ✅ DELETE (ADMIN)
        public async Task<string> DeleteAsync(int id, ClaimsPrincipal user)
        {
            var userId = int.Parse(
                user.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            var assessment = await _repo.GetByIdAsync(id);

            if (assessment == null)
                throw new NotFoundException("Assessment not found");

            if (assessment.CreatedBy != userId)
                throw new UnauthorizedAccessException("You cannot delete this assessment");

            await _repo.DeleteAsync(assessment);

            _logger.LogInformation(
                "Assessment {Id} deleted by user {UserId}",
                id, userId);

            return "Assessment deleted";
        }

        // ✅ UPDATE (ADMIN)
        public async Task<string> UpdateAsync(int id, UpdateAssessmentDto dto, ClaimsPrincipal user)
        {
            var userId = int.Parse(
                user.FindFirst(ClaimTypes.NameIdentifier)!.Value
            );

            var assessment = await _repo.GetByIdAsync(id);

            if (assessment == null)
                throw new NotFoundException("Assessment not found");

            if (assessment.CreatedBy != userId)
                throw new UnauthorizedAccessException("You cannot update this assessment");

            assessment.Title = dto.Title;
            assessment.Description = dto.Description;
            assessment.DurationMinutes = dto.DurationMinutes;

            // ✅ NEW UPDATES
            assessment.Status = dto.Status ?? assessment.Status;
            assessment.AvailableFrom = dto.AvailableFrom;
            assessment.AvailableUntil = dto.AvailableUntil;

            await _repo.UpdateAsync(assessment);

            _logger.LogInformation(
                "Assessment {Id} updated by user {UserId}",
                id, userId);

            return "Assessment updated";
        }
        public async Task UpdateStatusAsync(int id, string status, ClaimsPrincipal user)
        {
            var assessment = await _repo.GetByIdAsync(id);

            if (assessment == null)
                throw new NotFoundException("Assessment not found");

            assessment.Status = status;
            await _repo.UpdateAsync(assessment);
        }

    }
}