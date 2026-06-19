namespace SubmissionService.Models
{
    public class SubmissionAnswer
    {
        public int Id { get; set; }

        public int SubmissionId { get; set; }
        public Submission Submission { get; set; }

        public int QuestionId { get; set; }

        public string? SelectedAnswers { get; set; }
        public string? Code { get; set; }            // ✅ NEW FIELD

        public bool? IsCorrect { get; set; }
    }
}
