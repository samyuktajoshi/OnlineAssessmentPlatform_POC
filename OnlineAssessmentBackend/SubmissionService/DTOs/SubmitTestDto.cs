namespace SubmissionService.DTOs
{
    public class SubmitTestDto
    {
        public int AssessmentId { get; set; }
        public List<AnswerDto> Answers { get; set; }
    }

    public class AnswerDto
    {
        public int QuestionId { get; set; }
        public string SelectedAnswers { get; set; }
        public bool? IsCorrect { get; set; }
    }
}