using UserService.Models;

namespace UserService.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User> GetByUsernameAsync(string username);
        Task AddUserAsync(User user);
        Task<User> GetByEmailAsync(string email);
        Task<User?> GetByUsernameOrEmailAsync(string value);
        Task<List<User>> GetAllAsync();

    }
}
