using Microsoft.EntityFrameworkCore;
using System;
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
        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
        }
        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task AddUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }
    }
}
