namespace SubmissionService.DTOs
{
    public class SubmissionDto
    {
        public int SubmissionId { get; set; }
        public int AssessmentId { get; set; }
        public List<SubmissionAnswerDto> Answers { get; set; }
    }

    public class SubmissionAnswerDto
    {
        public int QuestionId { get; set; }
        public string SelectedAnswers { get; set; }
    }
}