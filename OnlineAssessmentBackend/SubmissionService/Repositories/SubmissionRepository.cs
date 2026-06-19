using Microsoft.EntityFrameworkCore;
using SubmissionService.Data;
using SubmissionService.Models;
using SubmissionService.Repositories.Interfaces;

namespace SubmissionService.Repositories
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly SubmissionDbContext _context;

        public SubmissionRepository(SubmissionDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Submission submission)
        {
            await _context.Submissions.AddAsync(submission);
            await _context.SaveChangesAsync();
        }

        public async Task<Submission?> GetByIdAsync(int id)
        {
            return await _context.Submissions
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
    }
}