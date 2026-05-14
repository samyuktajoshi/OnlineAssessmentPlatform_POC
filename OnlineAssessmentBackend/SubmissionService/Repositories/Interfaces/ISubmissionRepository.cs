using SubmissionService.Models;

namespace SubmissionService.Repositories.Interfaces
{
    public interface ISubmissionRepository
    {
        Task AddAsync(Submission submission);

        Task<Submission?> GetByIdAsync(int id);
    }
}
