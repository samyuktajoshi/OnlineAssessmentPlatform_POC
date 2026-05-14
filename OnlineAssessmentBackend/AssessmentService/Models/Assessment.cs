namespace AssessmentService.Models
{
    public class Assessment
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationMinutes { get; set; }
        public int CreatedBy { get; set; }
        public ICollection<AssessmentQuestion> AssessmentQuestions { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableUntil { get; set; }

        // Assessment lifecycle status
        public string Status { get; set; } = "Active";
    }
}
