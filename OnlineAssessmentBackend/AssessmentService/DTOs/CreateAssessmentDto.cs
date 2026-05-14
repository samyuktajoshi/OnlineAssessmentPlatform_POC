namespace AssessmentService.DTOs
{
    public class CreateAssessmentDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationMinutes { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableUntil { get; set; }
        public string Status { get; set; }
    }
}
