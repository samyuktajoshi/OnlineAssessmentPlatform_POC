using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;
using UserService.Repositories.Interfaces;

namespace UserService.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserDbContext _context;

        public UserRepository(UserDbContext context)
        {
            _context = context;
        }

        // ✅ GET BY EMAIL
        public async Task<User?> GetByEmailAsync(string email)
        {
            email = email.Trim().ToLower();

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email);
        }

        // ✅ GET BY USERNAME
        public async Task<User?> GetByUsernameAsync(string username)
        {
            username = username.Trim().ToLower();

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username);
        }

        // ✅ ✅ NEW PROFESSIONAL METHOD
        public async Task<User?> GetByUsernameOrEmailAsync(string value)
        {
            value = value.Trim().ToLower();

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u =>
                    u.Username.ToLower() == value ||
                    u.Email.ToLower() == value
                );
        }

        // ✅ ADD USER
        public async Task AddUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }
    }
}