namespace ResultService.DTOs
{
    public class SubmissionDto
    {
        public int SubmissionId { get; set; }
        public int AssessmentId { get; set; }
        public List<SubmissionAnswerDto> Answers { get; set; }
    }
}
