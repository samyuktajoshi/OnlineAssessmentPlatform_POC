namespace AssessmentService.DTOs
{
    public class AssessmentDto
    {
        public int AssessmentId { get; set; }
        public string AssessmentName { get; set; }
        public string Description { get; set; }
        public int DurationMinutes { get; set; }
        public DateTime? AvailableFrom { get; set; }   // ✅ added
        public DateTime? AvailableUntil { get; set; }
        public string Status { get; set; } = string.Empty;  // ✅ added

    }
}
