using System.ComponentModel.DataAnnotations;

public class UpdateAssessmentDto
{
    [Required]
    public string Title { get; set; }

    [Required]
    public string Description { get; set; }

    [Range(1, 300)]
    public int DurationMinutes { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableUntil { get; set; }
    public string Status { get; set; }
}