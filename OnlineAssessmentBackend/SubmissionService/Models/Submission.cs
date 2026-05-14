namespace SubmissionService.Models
{
    public class Submission
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public int AssessmentId { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        public List<SubmissionAnswer> Answers { get; set; }
    }
}
