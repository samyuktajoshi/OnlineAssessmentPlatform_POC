namespace ResultService.Models
{
    public class Result
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public int SubmissionId { get; set; }
        public int UserId { get; set; }
        public int AssessmentId { get; set; }

        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public double Percentage { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
