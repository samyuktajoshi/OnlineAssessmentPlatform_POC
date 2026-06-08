namespace ResultService.DTOs
{
    public class SubmissionAnswerDto
    {
        public int QuestionId { get; set; }
        public string SelectedAnswers { get; set; }

        public bool? IsCorrect { get; set; }

    }
}