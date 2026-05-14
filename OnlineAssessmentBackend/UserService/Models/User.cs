using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]

        public string Username { get; set; }

        public string Email { get; set; }

        public string PasswordHash { get; set; }

        public string Role { get; set; }
    }
}
